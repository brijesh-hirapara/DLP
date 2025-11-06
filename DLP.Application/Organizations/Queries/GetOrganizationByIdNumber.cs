using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Organizations.DTOs;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Organizations.Queries;

public class GetOrganizationByIdNumber : IRequest<OrganizationDto?>
{
    public string IdNumber { get; set; }
}

public class GetOrganizationByIdNumberHandler : IRequestHandler<GetOrganizationByIdNumber, OrganizationDto?>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUserService;

    public GetOrganizationByIdNumberHandler(IAppDbContext context, IActivityLogger activityLogger, ICurrentUserService currentUserService)
    {
        _context = context;
        _activityLogger = activityLogger;
        _currentUserService = currentUserService;
    }

    public async Task<OrganizationDto?> Handle(GetOrganizationByIdNumber request, CancellationToken cancellationToken)
    {
        try
        {
            var organization = await _context.Organizations
                .Include(i => i.CreatedBy)
                .Include(i => i.Municipality)
                .Include(i => i.ContactPerson)
                .ThenInclude(x => x.UserRoles)
                .ThenInclude(x => x.Role)
                .Include(x => x.Municipality.StateEntity)
                .Include(x => x.Municipality.Canton)
                .FirstOrDefaultAsync(x => x.IdNumber == request.IdNumber, cancellationToken);
            if (organization != null)
            {
                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Organization retrieved successfully."
                });

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
                    Municipality = organization.Municipality.Name,
                    MunicipalityId = organization.Municipality.Id,
                    Canton = organization.Municipality?.Canton?.Name,
                    CantonId = organization.Municipality?.CantonId,
                    Entity = organization.Municipality?.StateEntity?.Name,
                    EntityId = organization.Municipality?.StateEntityId,
                    Email = organization.Email,
                    PhoneNumber = organization.PhoneNumber,
                    WebsiteUrl = organization.WebsiteUrl,
                    LicenseId = organization.LicenseId,
                    LicenseDuration = organization.LicenseDuration,
                    Type = organization.Type,
                    ContactPersonFirstName = organization?.ContactPerson != null ? organization?.ContactPerson.FirstName : "",
                    ContactPersonLastName = organization?.ContactPerson != null ? organization?.ContactPerson.LastName : "",
                    ContactPersonEmail = organization?.ContactPerson != null ? organization?.ContactPerson.Email : "",
                    UserGroups = organization?.ContactPerson != null ? organization.ContactPerson.UserRoles.Select(x => x.Role.Name).ToList() : new List<string>(),
                    BusinessActivityId = organization?.BusinessActivityId,
                    BusinessActivity = organization?.BusinessActivity != null ? organization?.BusinessActivity?.Name : "",
                    LanguageId = organization.CreatedBy != null ? organization.CreatedBy?.LanguageId : LanguageConstants.DefaultLanguageId,
                    ContactPersonId = organization?.ContactPersonId,
                };
            }

            return null;


        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to retrieve organization", _currentUserService.UserId);
            throw new ApplicationException(
                $"Request failed to be created with error message: {ex.InnerException?.Message ?? ex.Message}"); ;
        }
    }
}
