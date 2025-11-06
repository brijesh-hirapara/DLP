using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Organizations.DTOs;
using DLP.Application.Requests.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Organizations.Queries;

public class GetOrganizationDetailsQuery : IRequest<OrganizationDto>
{
    public Guid OrganizationId { get; set; }
}

public class GetOrganizationDetailsQueryHandler : IRequestHandler<GetOrganizationDetailsQuery, OrganizationDto>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUserService;

    public GetOrganizationDetailsQueryHandler(IAppDbContext context, IActivityLogger activityLogger, ICurrentUserService currentUserService)
    {
        _context = context;
        _activityLogger = activityLogger;
        _currentUserService = currentUserService;
    }

    public async Task<OrganizationDto> Handle(GetOrganizationDetailsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var organization = (await _context.Organizations
                .Include(i => i.CreatedBy)
                .Include(i => i.ContactPerson)
                .ThenInclude(x => x.UserRoles)
                .ThenInclude(x => x.Role)
                .FirstOrDefaultAsync(x => x.Id == request.OrganizationId, cancellationToken))
                    ?? throw new NotFoundException($"Organization with ID {request.OrganizationId} not found.");

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = $"Organization details retrieved successfully (ID: {organization.Id})."
            });

            var requestDetail = _context.Requests.FirstOrDefault(x => x.ContactPersonEmail == organization.ContactPerson.Email);

            List<QuestionnaireDto> questionnaireDtos = new List<QuestionnaireDto>();
            if (requestDetail != null)
            {
                // Step 1: Get data from DB first
                var questionnaires = _context.Questionnaire
                    .Where(q => q.RequestId == requestDetail.Id.ToString())
                    .ToList(); // EF -> SQL executes here

                var codebooks = _context.Codebooks.ToList(); // small static table

                // Step 2: Perform join & mapping in-memory
                questionnaireDtos = (
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
            }


            return new OrganizationDto
            {
                Id = organization.Id,
                IdNumber = organization.IdNumber,
                Name = organization.Name,
                TaxNumber = organization.TaxNumber,
                ResponsiblePersonFullName = organization.ResponsiblePersonFullName,
                ResponsiblePersonFunction = organization.ResponsiblePersonFunction,
                Address = organization.Address,
                Place = organization.Place,
                PostCode = organization.PostCode,
                Email = organization.Email,
                PhoneNumber = organization.PhoneNumber,
                WebsiteUrl = organization.WebsiteUrl,
                LicenseId = organization.LicenseId,
                LicenseDuration = organization.LicenseDuration,
                Type = organization.Type == 0 ? null : organization.Type,
                ContactPersonFirstName = organization?.ContactPerson != null ? organization?.ContactPerson.FirstName : "",
                ContactPersonLastName = organization?.ContactPerson != null ? organization?.ContactPerson.LastName : "",
                ContactPersonEmail = organization?.ContactPerson != null ? organization?.ContactPerson.Email : "",
                UserGroups = organization?.ContactPerson != null ? organization.ContactPerson.UserRoles.Select(x => x.Role.Name).ToList() : new List<string>(),
                BusinessActivityId = organization?.BusinessActivityId,
                BusinessActivity = organization?.BusinessActivity != null ? organization?.BusinessActivity?.Name : "",
                LanguageId = organization.CreatedBy != null ? organization.CreatedBy?.LanguageId : null,
                CountryId = organization?.CountryId,
                Questionnaires = questionnaireDtos,
            };
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to retrieve organization details", _currentUserService.UserId);
            throw;
        }
    }
}
