using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.Qualifications.DTOs;
using DLP.Application.Requests.DTOs;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Requests.Queries;

public class GetRequestDetailsQuery : IRequest<RequestDetailsDto>
{
    public Guid Id { get; set; }
}

public class GetRequestDetailsQueryHandler : IRequestHandler<GetRequestDetailsQuery, RequestDetailsDto>
{
    private readonly IAppDbContext _context;
    private readonly ITranslationService _translationService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IActivityLogger _activityLogger;
    private readonly IBlobService _blobService;

    public GetRequestDetailsQueryHandler(
        IAppDbContext context,
        ITranslationService translationService,
        ICurrentUserService currentUserService,
        IActivityLogger activityLogger,
        IBlobServiceFactory blobServiceFactory)
    {
        _context = context;
        _translationService = translationService;
        _currentUserService = currentUserService;
        _activityLogger = activityLogger;
        _blobService = blobServiceFactory.Create(FolderNames.Requests);
    }

    public async Task<RequestDetailsDto> Handle(GetRequestDetailsQuery query, CancellationToken cancellationToken)
    {
        try
        {
            var request = await _context.Requests
                //.Include(x => x.BusinessActivity)
                .Include(x => x.ReviewedBy)
                //.Include(x => x.Municipality)
                //    .ThenInclude(x => x.Canton)
                //.Include(x=>x.Municipality)
                //    .ThenInclude(x=>x.StateEntity)
                .Include(x => x.Attachments)
                .FirstOrDefaultAsync(x => x.Id == query.Id, cancellationToken)
            ?? throw new ArgumentException($"Request {query.Id} not found");

            var requestDetails = request.Adapt<RequestDetailsDto>();
            requestDetails.CountryName = await _context.Codebooks
            .Where(c => c.Id == request.CountryId)
            .Select(c => c.Name)
            .FirstOrDefaultAsync(cancellationToken);
            requestDetails.ReviewedByName = request.ReviewedBy?.FullName;
            //requestDetails.BusinessActivity = request.BusinessActivity?.Name ?? "";
            //requestDetails.AreaOfExpertise = request.AreaOfExpertise.HasValue
            //    ? await _translationService.Translate(
            //        _currentUserService.LanguageCode,
            //        $"requests:area-of-expertise.{request.AreaOfExpertise}",
            //        AreaOfExpertiseDescriptions.Descriptions[request.AreaOfExpertise.Value])
            //    : null;

            //var certificationNumbers = !string.IsNullOrEmpty(request.CertificationNumbers)
            //           ? request.CertificationNumbers
            //            .Split(new char[] { CertificationNumberDelimiter.Delimiter[0] })
            //            .ToList()
            //           : new();
            //if (certificationNumbers.Any())
            //{
            //    requestDetails.CertificationNumbers = await AdjustCertificationNumbers(certificationNumbers, cancellationToken);
            //}

            var pendingSyncFiles = request.Attachments
                    .Where(f => string.IsNullOrEmpty(f.FilePath))
                    .ToList();

            foreach (var file in pendingSyncFiles)
            {
                var fileSync = await _context.FileSynchronizations
                    .Where(x => x.Id == file.Id)
                    .SingleOrDefaultAsync(cancellationToken);

                if (fileSync != null)
                {
                    var fileStream = new MemoryStream(fileSync.Data);
                    var filePath = await _blobService.SaveFileAsync(fileStream, fileSync.FileName);
                    file.FilePath = filePath;
                    requestDetails.Attachments.Add(new()
                    {
                        Id = file.Id,
                        FileName = filePath,
                        Size = file.Size,
                        ContentType = file.ContentType,
                    });
                    _context.RequestFiles.Update(file);
                    _context.FileSynchronizations.Remove(fileSync);
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            // Step 1: Get data from DB first
            var questionnaires = _context.Questionnaire
                .Where(q => q.RequestId == request.Id.ToString())
                .ToList(); // EF -> SQL executes here

            var codebooks = _context.Codebooks.ToList(); // small static table

            // Step 2: Perform join & mapping in-memory
            var questionnaireDtos = (
                from q in questionnaires
                let cbGuid = q.CodebookId ?? Guid.Empty
                let countryGuid = q.CountryId ?? Guid.Empty
                join cb in codebooks on cbGuid equals cb.Id into cbGroup
                from cb in cbGroup.DefaultIfEmpty()
                join country in codebooks on countryGuid equals country.Id into countryGroup
                from country in countryGroup.DefaultIfEmpty()
                orderby q.QuestionNo
                select new QuestionnaireDto
                {
                    Id = q.Id,
                    RequestId = q.RequestId,
                    RequestType = q.RequestType,
                    QuestionNo = q.QuestionNo,
                    Values = q.Values,
                    TrailerQTY = q.TrailerQTY,
                    CodebookId = q.CodebookId ?? Guid.Empty,
                    CodebookName = cb != null ? cb.Name : null,
                    CountryId = q.CountryId ?? Guid.Empty,
                    CountryName = country != null ? country.Name : null
                }
            ).ToList();

            requestDetails.Questionnaires = questionnaireDtos;
            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved Request details!"
            });

            return requestDetails;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, $"Failed to retrieve Request details with id {query.Id}", _currentUserService.UserId);

            throw;
        }
    }

    private Task<List<CertificateNumberAvailabilityResult>> AdjustCertificationNumbers(List<string> certificationNumbers, CancellationToken cancellationToken)
    {
        return _context.Qualifications
                 .Include(x => x.CertifiedTechnician)
                     .ThenInclude(x => x.Organization)
                 .Where(x => certificationNumbers.Contains(x.CertificateNumber))
                 .Select(x => new CertificateNumberAvailabilityResult
                 {
                     CertificateNumber = x.CertificateNumber,
                     CertifiedTechnicianFullName = x.CertifiedTechnician.FullName
                 })
                 .ToListAsync(cancellationToken);
    }
}