using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Attributes;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Models;
using DLP.Application.Requests.Notifications;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using static DLP.Application.Common.Auth.CustomPolicies;

namespace DLP.Application.Requests.Commands;

public class CreateRequestCommand : IRequest<string>
{
    [SwaggerExclude] public required string CurrentUserId { get; set; }
    [SwaggerExclude] public bool IsLoggedInAsCompany { get; set; }
    public Guid? CompanyId { get; set; } // from token
    public bool IsFromPublic { get; set; }

    /// <summary>
    /// Company Identification Number
    /// </summary>
    public string IdNumber { get; set; }

    public string? CompanyName { get; set; }
    public string? CompanyEmailAddress { get; set; }
    public string? CompanyPhoneNumber { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? TaxNumber { get; set; }
    public string? ResponsiblePersonFullName { get; set; }
    public string? ResponsiblePersonFunction { get; set; }
    public string ContactPersonFirstName { get; set; }
    public string ContactPersonLastName { get; set; }
    public string ContactPersonEmail { get; set; }
    public string? Address { get; set; }
    public string? Place { get; set; }
    public string? PostCode { get; set; }
    public string? Comments { get; set; }
    public Guid? MunicipalityId { get; set; }
    public Guid? StateEntityId { get; set; }
    public string? LicenseId { get; set; }
    public DateTime? LicenseDuration { get; set; }

    /// <summary>
    /// Holds one or more certification numbers of certified technicians. Numbers separated by semicolon (;)
    /// </summary>
    public List<string>? CertificationNumbers { get; set; } = new();

    public int? TotalNumberOfServiceTechnians { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the company meets the equipment regulations.
    /// </summary>
    public bool? MeetsEquipmentRegulations { get; set; }

    public Guid? LanguageId { get; set; }
    public RequestType Type { get; set; }
    public RequestStatus? Status { get; set; }
    public RequestCompanyType? CompanyType { get; set; }
    public AreaOfExpertise? AreaOfExpertise { get; set; }
    public Guid? BusinessActivityId { get; set; }
    public List<IFormFile>? Attachments { get; set; } = new List<IFormFile>();
    public bool? NeedToSendMail { get; set; } = true;
    public bool ReceiveNews { get; set; }
    public bool HasVatIdAndAcceptsTerms { get; set; }
    public Guid CountryId { get; set; }
    public string QuestionnaireListJson { get; set; }
    //public List<Questionnaire> QuestionnaireList { get; set; } = new List<Questionnaire>();
}

public class CreateRequestCommandHandler : IRequestHandler<CreateRequestCommand, string>
{
    private readonly IAppDbContext _dbContext;
    private readonly IMediator _mediator;
    private readonly ILicenseIdGenerator _licenseIdGenerator;
    private readonly IBlobService _blobService;
    private readonly IEmailCommunicationService _emailCommunicationService;
    private readonly ILogger<CreateRequestCommandHandler> _logger;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUser;

    public CreateRequestCommandHandler(
        IAppDbContext dbContext,
        IMediator mediator,
        ILicenseIdGenerator licenseIdGenerator,
        IBlobServiceFactory blobServiceFactory,
        IEmailCommunicationService emailCommunicationService,
        ILogger<CreateRequestCommandHandler> logger,
        IActivityLogger activityLogger,
        ICurrentUserService currentUser)
    {
        _dbContext = dbContext;
        _mediator = mediator;
        _licenseIdGenerator = licenseIdGenerator;
        _blobService = blobServiceFactory.Create(FolderNames.Requests);
        _emailCommunicationService = emailCommunicationService;
        _logger = logger;
        _activityLogger = activityLogger;
        _currentUser = currentUser;
    }

    public async Task<string> Handle(CreateRequestCommand command, CancellationToken cancellationToken)
    {
        var filesResponse = new List<NotificationFileModel>();
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {

            var requestExistChecked = await _dbContext.Requests.FirstOrDefaultAsync(x => (x.IdNumber == command.IdNumber || x.ContactPersonEmail == command.ContactPersonEmail) && x.CompanyType == command.CompanyType && x.Status == RequestStatus.Pending);
            if (requestExistChecked != null)
            {
                throw new ApplicationException($"Request Already exist");
            }

            if (command.Status == RequestStatus.Approved)
            {
                var requestChecked = await _dbContext.Requests.FirstOrDefaultAsync(x => x.IdNumber == command.IdNumber && x.CompanyType == command.CompanyType && x.Status != RequestStatus.Rejected);
                if (requestChecked != null)
                {
                    throw new ApplicationException($"Id Number {command.IdNumber} Already exist");
                }
            }

            string municipatilityId = "af48bb05-8dd6-11ee-85aa-0242ac110004";
            Guid municipalityGuid = Guid.Parse(municipatilityId);

            var request = new Request
            {
                Id = Guid.NewGuid(),
                IdNumber = command.TaxNumber,
                Address = command.Address,
                AreaOfExpertise = command.AreaOfExpertise,
                BusinessActivityId = command.BusinessActivityId,
                //CertificationNumbers = command.CertificationNumbers?.Any() == true
                //    ? string.Join(CertificationNumberDelimiter.Delimiter, command.CertificationNumbers)
                //    : null,
                //TotalNumberOfServiceTechnians = command.TotalNumberOfServiceTechnians,
                Comments = command.Comments,
                CompanyId = command.CompanyId,
                CompanyEmailAddress = command.CompanyEmailAddress,
                CompanyName = command.CompanyName,
                CompanyPhoneNumber = command.CompanyPhoneNumber,
                CompanyType = command.CompanyType,
                ContactPerson = $"{command.ContactPersonFirstName} {command.ContactPersonLastName}",
                ContactPersonEmail = command.ContactPersonEmail,
                LicenseDuration = command.LicenseDuration,
                MeetsEquipmentRegulations = command.MeetsEquipmentRegulations,
                LanguageId = command.LanguageId ?? LanguageConstants.DefaultLanguageId.Value,
                MunicipalityId = municipalityGuid,
                Place = command.Place,
                PostCode = command.PostCode,
                ResponsiblePersonFullName = command.ResponsiblePersonFullName,
                ResponsiblePersonFunction = command.ResponsiblePersonFunction,
                TaxNumber = command.TaxNumber,
                Status = command.IsFromPublic
                    ? RequestStatus.Pending
                    : command.Status ?? RequestStatus.Pending,
                WebsiteUrl = command.WebsiteUrl,
                Type = command.Type,
                RequestId = await GetNextRequestId(),
                CreatedAt = DateTime.UtcNow,
                Attachments = await UploadAttachments(command.Attachments, filesResponse, cancellationToken),
                IsFromPublic = command.IsFromPublic,
                ReceiveNews = command.ReceiveNews,
                HasVatIdAndAcceptsTerms = command.HasVatIdAndAcceptsTerms,
                CountryId = command.CountryId
            };

            if (!string.IsNullOrEmpty(command.LicenseId))
            {
                request.LicenseId = command.LicenseId;
            }

            //if (request.Type == RequestType.RequestForExtensionOfLicenseOfServiceCompanies || request.Type == RequestType.RegistrationAndLicensingOfServiceCompanies)
            //{
            //    request.LicenseId = (await _dbContext.Organizations.FirstOrDefaultAsync(x => x.Id == command.CompanyId))
            //        ?.LicenseId;
            //}

            if (ShouldGenerateLicenseId(request.Type, request.LicenseId))
            {
                request.LicenseId = await _licenseIdGenerator.GenerateUniqueLicenseId();
            }

            await _dbContext.Requests.AddAsync(request, cancellationToken);
            if (_currentUser.UserId != null)
            {
                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Request created successfully!"
                });
            }
            else
            {
                await _dbContext.SaveChangesAsync();
            }
            var questionnaires = JsonConvert.DeserializeObject<List<QuestionnaireRequestParameter>>(command.QuestionnaireListJson);
            if (questionnaires != null && questionnaires.Count > 0)
            {
                //var objQuestionnaires = questionnaires.Select(q => new Questionnaire
                //{
                //    Id = Guid.NewGuid(),
                //    RequestId = request.RequestId,
                //    RequestType = Convert.ToString(command.Type),
                //    QuestionNo = q.QuestionNo,
                //    Values = q.Values,
                //    CodebookId = q.CodebookId,
                //    TrailerQTY = q.TrailerQTY,
                //    CountryId = q.CountryId
                //}).ToList();
                var objQuestionnaires = questionnaires.Select(q => new Questionnaire
                {
                    Id = Guid.NewGuid(),
                    RequestId = Convert.ToString(request.Id),
                    RequestType = Convert.ToString(command.Type),
                    QuestionNo = q.QuestionNo,
                    Values = q.Values,
                    //CodebookId = string.IsNullOrEmpty(q.CodebookId) ? null : q.CodebookId,
                    CodebookId = string.IsNullOrEmpty(q.CodebookId) ? (Guid?)null : Guid.Parse(q.CodebookId),
                    TrailerQTY = q.TrailerQTY,
                    //CountryId = string.IsNullOrEmpty(q.CountryId) ? null : q.CountryId
                    CountryId = string.IsNullOrEmpty(q.CountryId) ? (Guid?)null : Guid.Parse(q.CountryId),
                    ModuleName = "Request"
                }).ToList();

                await _dbContext.Questionnaire.AddRangeAsync(objQuestionnaires, cancellationToken);
                await _dbContext.SaveChangesAsync();
            }

            //await _mediator.Publish(
            //    new CreateRequestNotification(request, command.StateEntityId,
            //        filesResponse), cancellationToken);

            if (request.Status == RequestStatus.Approved)
            {
                await _mediator.Send(new ApproveRequestCommand
                {
                    CurrentUserId = command.CurrentUserId,
                    Comments = command.Comments,
                    LicenseDuration = request.LicenseDuration,
                    LicenseId = request.LicenseId,
                    RequestId = request.Id,
                    NeedToSendMail = command.NeedToSendMail ?? false
                }, cancellationToken);
            }
            else if (request.Status == RequestStatus.Rejected)
            {
                await _mediator.Send(new RejectRequestCommand
                {
                    RequestId = request.Id,
                    CurrentUserId = command.CurrentUserId,
                    Comments = command.Comments,
                }, cancellationToken);
            }
            else
            {
                await _emailCommunicationService.SendRequestSubmittedEmail(request, cancellationToken);
            }
            await transaction.CommitAsync(cancellationToken);

            return request.RequestId;
        }
        catch (Exception ex)
        {
            // Clean up any uploaded blobs
            foreach (var path in filesResponse.Select(x => x.FilePath))
            {
                await _blobService.DeleteFileAsync(path);
            }

            // Log and re-throw the exception
            await _activityLogger.Exception(ex.Message, "Request couldn't be created!", _currentUser.UserId);
            _logger.LogError(ex, "An error occurred while handling the CreateRequestCommand");
            throw new ApplicationException(
                $"Request failed to be created with error message: {ex.InnerException?.Message ?? ex.Message}");
        }
    }

    private async Task<ICollection<RequestFile>> UploadAttachments(List<IFormFile> attachments,
        ICollection<NotificationFileModel> filesResponse, CancellationToken cancellationToken)
    {
        var uploadedFiles = new List<RequestFile>();

        foreach (var attachment in attachments)
        {
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(attachment.FileName);
            await using var stream = attachment.OpenReadStream();
            var filePath = await _blobService.SaveFileAsync(stream, fileName);

            filesResponse.Add(new NotificationFileModel(filePath, fileName, attachment.ContentType));
            var requestFile = new RequestFile
            {
                FileName = fileName,
                FilePath = filePath,
                Size = attachment.Length,
                ContentType = attachment.ContentType,
                CreatedAt = DateTime.UtcNow,
            };
            uploadedFiles.Add(requestFile);
        }

        return uploadedFiles;
    }

    private static bool ShouldGenerateLicenseId(RequestType type, string? licenseId)
    {
        return string.IsNullOrEmpty(licenseId) && type.IsOneOf(
            RequestType.RegistraterAsShipper,
            RequestType.RegistraterAsCarrier);
    }

    private async Task<string> GetNextRequestId()
    {
        // Retrieve the last numeric part of the highest RequestId in the database
        var lastNumericPart = await _dbContext.Requests
            .OrderByDescending(r => r.RequestId)
            .Select(r => r.RequestId.Substring(5)) // RequestId format is YEAR-XXXX (5 characters for year)
            .FirstOrDefaultAsync();

        int nextNumericPart = string.IsNullOrEmpty(lastNumericPart)
            ? 1
            : int.Parse(lastNumericPart) + 1;
        string year = DateTime.Now.Year.ToString();
        string formattedNumericPart = nextNumericPart.ToString("D4");
        string requestId = $"{year}-{formattedNumericPart}";

        return requestId;
    }
}