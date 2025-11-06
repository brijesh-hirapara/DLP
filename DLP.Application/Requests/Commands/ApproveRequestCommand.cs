using Hangfire;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.CertifiedTechnicians.Commands;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Security;
using DLP.Application.Qualifications.DTOs;
using DLP.Application.Qualifications.Queries;
using DLP.Application.Requests.Notifications;
using DLP.Application.ServiceTechnician.Commands;
using DLP.Application.ServiceTechnician.Queries;
using DLP.Application.UserGroups.Commands;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace DLP.Application.Requests.Commands;

public class ApproveRequestCommand : IRequest<Unit>
{
    public required string CurrentUserId { get; set; }
    public Guid RequestId { get; set; }
    public string? LicenseId { get; set; }
    public DateTime? LicenseDuration { get; set; }
    public string? Comments { get; set; }
    public bool NeedToSendMail { get; set; } = true;
}

public class ApproveRequestCommandHandler : IRequestHandler<ApproveRequestCommand, Unit>
{
    private readonly IAppDbContext _dbContext;
    private readonly IMediator _mediator;
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly ILicenseIdGenerator _licenseIdGenerator;
    private readonly IEmailCommunicationService _emailCommunicationService;
    private readonly ITranslationService _translationService;
    private readonly ILogger<ApproveRequestCommandHandler> _logger;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUser;

    public ApproveRequestCommandHandler(
        IAppDbContext dbContext,
        IMediator mediator,
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
        ILicenseIdGenerator licenseIdGenerator,
        IEmailCommunicationService emailCommunicationService,
        ITranslationService translationService,
        ILogger<ApproveRequestCommandHandler> logger,
        IActivityLogger activityLogger,
        ICurrentUserService currentUser
        )
    {
        _dbContext = dbContext;
        _mediator = mediator;
        _userManager = userManager;
        _roleManager = roleManager;
        _licenseIdGenerator = licenseIdGenerator;
        _emailCommunicationService = emailCommunicationService;
        _translationService = translationService;
        _logger = logger;
        _activityLogger = activityLogger;
        _currentUser = currentUser;
    }
    public async Task<Unit> Handle(ApproveRequestCommand command, CancellationToken cancellationToken)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var request = await _dbContext.Requests
                .Include(x => x.Municipality)
                .FirstOrDefaultAsync(x => x.Id == command.RequestId, cancellationToken)
                    ?? throw new Exception($"Request {command.RequestId} not found");

            var shouldSendRequestApprovedEmail = true;
            Organization? company = null;
            // if request is coming from public
            // or if it's internally added but company is not yet created (first request)
            var companyNeedsToBeCreated = request.IsFromPublic || request.CompanyId == null;
            CompanyBranch? mainBranch = null;

            if (request.CertificationNumbers != null)
            {
                List<string> certificationArray = new List<string>();
                if (!string.IsNullOrEmpty(request.CertificationNumbers))
                {
                    certificationArray = request.CertificationNumbers.Split('|').ToList();
                    var checkCertificateQuery = new CheckCertificateNumberAvailabilityQuery
                    {
                        CertificationNumbers = certificationArray,
                        OrganizationId = _currentUser.OrganizationId
                    };

                    // Use the Mediator to send the query
                    List<CertificateNumberAvailabilityResult> result = await _mediator.Send(checkCertificateQuery);
                    if (result.Count > 0)
                    {
                        var unavailableCertificates = result
                        .Where(r => !r.IsAvailable)
                        .Select(r => r.CertificateNumber)
                        .ToList();

                        if (unavailableCertificates.Any())
                        {
                            // Join the unavailable certificate numbers into a single string for the error message
                            string unavailableCertificatesString = string.Join(", ", unavailableCertificates);

                            // Throw exception with the list of unavailable certificate numbers
                            throw new Exception($"Certified Service Technicians are unavailable: {unavailableCertificatesString}");
                        }
                    }
                }


            }

            if (companyNeedsToBeCreated)
            {
                request.UpdatedById = command.CurrentUserId;
                (company, mainBranch) = await CreateUserAndCompany(request, cancellationToken);
                request.CompanyId = company.Id;

                // since its first request, we don't want to send email about approva
                // we only send greeting email that indicates company created
                shouldSendRequestApprovedEmail = false;
            }
            else
            {
                company = await _dbContext.Organizations
                    .Include(x => x.CreatedBy)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Id == request.CompanyId, cancellationToken);
            }

            if (company == null)
            {
                _logger.LogCritical(@$"Company with id {request.CompanyId} was not created and this should not happen. 
                Something wrong happened during approval of request {request.Type}.");

                await _activityLogger.Error("Something wrong happened during approval of request", _currentUser.UserId);

                throw new Exception("Something wrong happened during approval of request");
            }

            request.Status = RequestStatus.Approved;
            request.ReviewedById = _currentUser.UserId;
            request.ReviewedAt = DateTime.Now;
            //validate license id if different from current/auto-generated one
            if (request.LicenseId != command.LicenseId && !string.IsNullOrEmpty(command.LicenseId))
            {
                var licenseIdExists = await _dbContext.Organizations.AnyAsync(x => x.LicenseId == command.LicenseId, cancellationToken);
                if (licenseIdExists)
                {
                    await _activityLogger.Error($"License id {command.LicenseId} already exists", _currentUser.UserId);
                    throw new Exception($"License id {command.LicenseId} already exists");
                }
                request.LicenseId = command.LicenseId;
            }

            request.LicenseDuration = command.LicenseDuration.HasValue
                ? command.LicenseDuration
                : request.LicenseDuration;
            request.Comments += "\nComments from approval: " + command.Comments;

            if (ShouldGenerateLicenseId(request))
            {
                request.LicenseId = await _licenseIdGenerator.GenerateUniqueLicenseId();
            }

            if (!companyNeedsToBeCreated)
            {
                company.LicenseId = request.LicenseId;
                company.LicenseDuration = request.LicenseDuration;
                company.BusinessActivityId = request.BusinessActivityId ?? company.BusinessActivityId;
                company.Type = request.CompanyType.HasValue
                    ? GetCompanyType(request.Type)
                    : company.Type;
                _dbContext.Organizations.Update(company);
            }

            var (companyRegType, newRoles) = await AddCompanyRegisterTypesAndAssignUserGroup(request.Type, company, shouldCreateSuperAdminUserGroup: companyNeedsToBeCreated, cancellationToken);

            if (shouldSendRequestApprovedEmail)
            {
                if (command.NeedToSendMail)
                {
                    await _emailCommunicationService.SendRequestApprovedEmail(request, cancellationToken);
                }
            }

            await AssignCompanyToCertifiedTechnicians(company.Id, request.CertificationNumbers, companyNeedsToBeCreated, cancellationToken);

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUser.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully Approved Request"
            });

            var companyRegTypeId = companyRegType != null
                ? companyRegType.Id
                : Guid.Empty;
            var mainBranchId = mainBranch != null
                ? mainBranch.Id
                : Guid.Empty;

            await transaction.CommitAsync(cancellationToken);

            await _mediator.Publish(new ApproveRequestNotification(
                request.Id, request.Type, request.CertificationNumbers,
                company.Id,
                company.ContactPersonId,
                companyRegTypeId, mainBranchId, newRoles, companyNeedsToBeCreated), cancellationToken);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            var message = $"Message: {ex.Message}, Details: {JsonConvert.SerializeObject(ex)}";
            await _activityLogger.Exception(message, "Failed to approve the request", _currentUser.UserId);            
            throw new Exception(ex.Message);
        }
    }

    private async Task<(CompanyRegisterType CompanyRegisterType, List<string>? NewRoles)> AddCompanyRegisterTypesAndAssignUserGroup(RequestType requestType, Organization company, bool shouldCreateSuperAdminUserGroup, CancellationToken cancellationToken)
    {
        //if (requestType == RequestType.RequestForExtensionOfLicenseOfServiceCompanies)
        //{
        //    return (null, null);
        //}

        //var companyType = requestType == RequestType.RegistrationOfOwnersAndOperators
        //        ? CompanyType.OwnerAndOperator
        //        : requestType == RequestType.RegistrationAndLicensingOfServiceCompanies
        //            ? CompanyType.ServiceCompanyEnterpreneur
        //            : CompanyType.ImporterExporter;

        var companyType = requestType == RequestType.RegistraterAsShipper
                ? CompanyType.Shipper : CompanyType.Carrier;
        var typeExists = await _dbContext.CompanyRegisterTypes
                .FirstOrDefaultAsync(x => x.OrganizationId == company.Id && x.Type == companyType, cancellationToken);
        if (typeExists != null)
        {
            return (typeExists, null);
        }

        var newCompanyRegType = new CompanyRegisterType
        {
            Id = Guid.NewGuid(),
            OrganizationId = company.Id,
            Type = companyType
        };
        await _dbContext.CompanyRegisterTypes.AddAsync(newCompanyRegType, cancellationToken);

        var userGroups = await AssignUserGroup(requestType, company.CreatedBy!, company.Name, shouldCreateSuperAdminUserGroup, cancellationToken);
        return (newCompanyRegType, userGroups);
    }

    private async Task<(Organization Organization, CompanyBranch CompanyBranch)> CreateUserAndCompany(Request request, CancellationToken cancellationToken)
    {
        var organization = await CreateOrganization(request, cancellationToken);
        var (companyContactPerson, oneTimePassword) = await CreateUser(request, organization);
        var branch = await CreateOrganizationMainBranch(organization, companyContactPerson, cancellationToken);
        await UpdateAuditOnOrganizationAndRequest(request, organization, companyContactPerson, request.UpdatedById!, cancellationToken);
        await _emailCommunicationService.SendCompanyApprovedEmail(
            organization.Name!,
            companyContactPerson.Email!,
            oneTimePassword,
            cancellationToken);
        return (organization, branch);
    }

    private async Task<CompanyBranch> CreateOrganizationMainBranch(Organization organization, User companyContactPerson, CancellationToken cancellationToken)
    {
        var headQuarterTranslation = await _translationService
            .Translate(companyContactPerson.LanguageId.Value, "company-branch-headquarter", "Headquarter");
        var branch = new CompanyBranch
        {
            OrganizationId = organization.Id,
            Organization = organization,
            Address = organization.Address,
            Email = organization.Email,
            IdNumber = organization.IdNumber,
            MunicipalityId = organization.MunicipalityId,
            Place = organization.Place,
            BranchOfficeName = $"{headQuarterTranslation} {organization.Name}",
            ContactPerson = companyContactPerson.FullName,
            ContactPhone = organization.PhoneNumber,
            CreatedAt = DateTime.Now,
            IsDeleted = false,
            CreatedById = organization.CreatedById,
            ActionTakenBy = organization.ContactPersonId,
        };
        branch.BeforeLocalSync();
        await _dbContext.CompanyBranches.AddAsync(branch, cancellationToken);
        return branch;
    }

    private async Task<Organization> CreateOrganization(Request request, CancellationToken cancellationToken)
    {
        var organizationId = Guid.NewGuid();
        var organization = new Organization
        {
            Id = organizationId,
            IdNumber = request.IdNumber,
            Name = request.CompanyName!,
            TaxNumber = request.TaxNumber,
            ResponsiblePersonFullName = request.ResponsiblePersonFullName,
            ResponsiblePersonFunction = request.ResponsiblePersonFunction,
            BusinessActivityId = request.BusinessActivityId,
            Address = request.Address,
            Place = request.Place,
            MunicipalityId = request.MunicipalityId,
            StateEntityId = request.Municipality.StateEntityId,
            PostCode = request.PostCode,
            Email = request.CompanyEmailAddress,
            PhoneNumber = request.CompanyPhoneNumber,
            WebsiteUrl = request.WebsiteUrl,
            LicenseId = request.LicenseId,
            LicenseDuration = request.LicenseDuration,
            Type = GetCompanyType(request.Type),
            CreatedAt = DateTime.UtcNow,
            CreatedById = request.CreatedById,
            IsDeleted = false,
            ActionTakenBy = request.CreatedById,
            CountryId = request.CountryId,
        };
        organization.BeforeLocalSync();
        await _dbContext.Organizations.AddAsync(organization, cancellationToken);
        return organization;
    }

    private static OrganizationTypeEnum GetCompanyType(RequestType? companyType)
    {
        return companyType switch
        {
            RequestType.RegistraterAsShipper => OrganizationTypeEnum.SHIPPER,
            RequestType.RegistraterAsCarrier => OrganizationTypeEnum.CARRIER,
            //RequestCompanyType.Importer => OrganizationTypeEnum.IMPORTER,
            //RequestCompanyType.Exporter => OrganizationTypeEnum.EXPORTER,
            //RequestCompanyType.ImporterExporter => OrganizationTypeEnum.IMPORTER_EXPORTER,
            _ => OrganizationTypeEnum.SHIPPER,
        };
    }

    private async Task<(User User, string OneTimePassword)> CreateUser(Request request, Organization organization)
    {
        var (firstName, lastName) = GetFirstAndLastName(request.ContactPerson!);
        var user = new User
        {
            NormalizedEmail = request.ContactPersonEmail!,
            UserName = request.ContactPersonEmail!,
            Email = request.ContactPersonEmail!,
            FirstName = firstName,
            LastName = lastName,
            LanguageId = request.LanguageId, // TODO: to be changed
            OrganizationId = organization.Id,
            MunicipalityId = organization.MunicipalityId,
            StateEntityId = organization.StateEntityId,
            MustChangePassword = true,
            CreatedAt = DateTime.UtcNow,
            CreatedById = request.CreatedById,
            AccessLevel = AccessLevelType.Company,
            PhoneNumber = request.CompanyPhoneNumber,
        };

        var oneTimePassword = PasswordUtils.GenerateOTP();
        var result = await _userManager.CreateAsync(user, oneTimePassword);

        if (!result.Succeeded)
        {
            var errorMessages = string.Join("\n", result.Errors.Select(x => x.Description));
            _logger.LogError(errorMessages);
            throw new Exception(errorMessages);
        }
        return (user, oneTimePassword);
    }

    private async Task UpdateAuditOnOrganizationAndRequest(Request request, Organization company, User companyContactPerson, string currentUserId, CancellationToken cancellationToken)
    {
        if (companyContactPerson == null)
        {
            _logger.LogCritical(@$"
                User with email {request.ContactPersonEmail} was not created and this should not happen. 
                Something wrong went happened during approval of request {request.Type}");
            throw new Exception("Something wrong went happened during approval of request");
        }

        company.CreatedBy = companyContactPerson;
        company.CreatedById = companyContactPerson.Id;
        company.ContactPersonId = companyContactPerson.Id;
        request.CreatedBy = companyContactPerson;
        request.CreatedById = companyContactPerson.Id;
        request.CompanyId = company.Id;
        request.UpdatedById = currentUserId;
        request.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

    }

    private async Task<List<string>> AssignUserGroup(RequestType requestType, User user, string companyName, bool shouldCreateSuperAdminUserGroup, CancellationToken cancellationToken)
    {
        var companyUserGroup = GetProperUserGroup(requestType);
        var userGroups = new List<string> { companyUserGroup };
        if (shouldCreateSuperAdminUserGroup)
        {
            var saTranslation = await _translationService
            .Translate(user.LanguageId.Value, "super-admin", "Super Administrator");
            var newRole = $"{companyName} - {saTranslation}";
            var exists = await _dbContext.Roles.AnyAsync(x => x.Name.Equals(newRole));
            if (!exists)
            {
                var companyRole = await _roleManager.FindByNameAsync(companyUserGroup);
                var userGroupPermissions = (await _roleManager.GetClaimsAsync(companyRole))
                    .Select(p => p.Value)
                    .ToHashSet();

                await _mediator.Send(new AddUserGroupCommand
                {
                    Name = newRole,
                    AccessLevel = AccessLevelType.Company,
                    Permissions = userGroupPermissions.Select(x => new UserGroupPermission
                    {
                        Name = x,
                        Checked = true,
                    }).ToList(),
                    Users = new()
                    {
                        new() {Id = user.Id},
                    },
                    CreatedById = user.Id,
                }, cancellationToken);

                userGroups.Add(newRole);
            }
        }

        await _userManager.AddToRolesAsync(user, userGroups);
        return userGroups;
    }

    private async Task AssignCompanyToCertifiedTechnicians(Guid companyId, string? certificationNumbers, bool companyNeedsToBeCreated, CancellationToken cancellationToken)
    {
        var certificationNumbersList = !string.IsNullOrEmpty(certificationNumbers)
                   ? certificationNumbers.Split(new char[] { CertificationNumberDelimiter.Delimiter[0] }).ToList()
                   : new();

        var technicianIds = _dbContext.Qualifications
            .Where(x => certificationNumbersList.Contains(x.CertificateNumber))
            .Select(x => x.CertifiedTechnicianId)
            .ToList();

        await _mediator.Send(new StartEmploymentCommand
        {
            TechnicianIds = technicianIds,
            OrganizationId = companyId,
            TriggerNotification = !companyNeedsToBeCreated,
        }, cancellationToken);
    }


    private static bool ShouldGenerateLicenseId(Request request)
    {
        //return string.IsNullOrEmpty(request.LicenseId) && request.Type.IsOneOf(
        //    RequestType.RegistrationAndLicensingOfServiceCompanies,
        //    RequestType.RegistrationAndLicensingOfImportersExporters);

        return string.IsNullOrEmpty(request.LicenseId) && request.Type.IsOneOf(
            RequestType.RegistraterAsShipper,
            RequestType.RegistraterAsCarrier);
    }

    private static string GetProperUserGroup(RequestType requestType)
    {
        return requestType switch
        {
            //RequestType.RegistrationOfOwnersAndOperators => PredefinedUserGroups.COMP_KGH_OWNER_OPERATOR,
            //RequestType.RegistrationAndLicensingOfServiceCompanies => PredefinedUserGroups.COMP_KGH_SERVICE,
            //RequestType.RegistrationAndLicensingOfImportersExporters => PredefinedUserGroups.COMP_KGH_IMPORT_EXPORT,

            RequestType.RegistraterAsShipper => PredefinedUserGroups.COMP_DLP_SHIPPER,
            RequestType.RegistraterAsCarrier => PredefinedUserGroups.COMP_DLP_CARRIER,
            _ => throw new ArgumentOutOfRangeException(nameof(requestType), requestType, null)
        };
    }

    private static (string, string) GetFirstAndLastName(string fullName)
    {
        var names = fullName.Split(' ');
        return names.Length >= 2 ? (names[0], names[1]) : // Assumes first word is the first name, second word is the last name.
                                                          // Handle cases where the full name doesn't split into two (like if there's only a first name). Adjust as necessary.
            (names[0], string.Empty);
    }
}
