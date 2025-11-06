using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Requests.Notifications;

public abstract class GenericApproveRequestHandler<TContext> : INotificationHandler<ApproveRequestNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IAppDbContext _mainContext;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    public GenericApproveRequestHandler(TContext context,
        IAppDbContext mainContext,
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _context = context;
        _mainContext = mainContext;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(ApproveRequestNotification notification, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrEmpty(notification.SpecificHandlerOnly) &&
            notification.SpecificHandlerOnly != _handlerName)
            return;

        var isDatabaseAvailable = await _healthCheckService.IsDatabaseAvailable<TContext>();
        if (!isDatabaseAvailable)
        {
            await LogFailedSynchronization(notification, new Exception("Database is unavailable"),
                cancellationToken);
            return;
        }

        var companyToBeSynced = await GetCompanyToBeSyncedAsync(notification, cancellationToken);
        if (companyToBeSynced is null) return;

        try
        {
            await UpdateOrAddCompanyAsync(notification, companyToBeSynced, notification.RequestType, cancellationToken);
            await AssignCompanyToCertifiedTechnicians(companyToBeSynced.Id, notification.RequestCertificationNumbers,
                cancellationToken);

            await _context.SaveChangesAsync(cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(ApproveRequestNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.UPDATE,
            nameof(Request), cancellationToken);
    }

    private async Task TryUpdateRequest(Guid requestId, CancellationToken cancellationToken)
    {
        var request =
            await _context.Requests.FirstOrDefaultAsync(x => x.Id == requestId, cancellationToken: cancellationToken);
        if (request is not null)
        {
            _context.Requests.Update(request);
        }
    }

    private Task<Organization?> GetCompanyToBeSyncedAsync(ApproveRequestNotification notification,
        CancellationToken cancellationToken)
    {
        return _mainContext.Organizations
            .Include(x => x.ContactPerson)
            .ThenInclude(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .ThenInclude(x => x.Claims)
            .Include(x => x.Branches)
            .Include(x => x.CompanyRegisterTypes)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == notification.OrganizationId, cancellationToken);
    }

    private async Task UpdateOrAddCompanyAsync(ApproveRequestNotification notification, Organization companyToBeSynced,
        RequestType requestType, CancellationToken cancellationToken)
    {
        var (newCompany, user, newCompanyRegType, predefinedRole) =
            await PrepareNewCompanyData(companyToBeSynced, notification, requestType, cancellationToken);
        if (notification.CompanyNeedsToBeCreated)
        {
            newCompany.ContactPerson.Organization = null;
            newCompany.ContactPerson.OrganizationId = null;
            await _context.Users.AddAsync(user, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            newCompany.ContactPerson.OrganizationId = newCompany.Id;
            newCompany.ContactPersonId = SystemConstants.SystemUserId;
            await _context.Organizations.AddAsync(newCompany, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
        else
        {
            newCompany.Branches = null;
            newCompany.CompanyRegisterTypes = null;
            newCompany.LicenseId = companyToBeSynced.LicenseId;
            newCompany.LicenseDuration = companyToBeSynced.LicenseDuration;
            newCompany.BusinessActivityId = companyToBeSynced.BusinessActivityId;
            newCompany.Type = companyToBeSynced.Type;
            _context.Organizations.Update(newCompany);
            await _context.SaveChangesAsync(cancellationToken);
            if (newCompanyRegType != null)
            {
                newCompanyRegType.Organization = null;
                await _context.CompanyRegisterTypes.AddAsync(newCompanyRegType, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        if (predefinedRole != null)
        {
            predefinedRole.User = null;
            predefinedRole.Role = null;
            await _context.UserRoles.AddAsync(predefinedRole, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var request = await _context.Requests
            .AsNoTrackingWithIdentityResolution()
            .FirstOrDefaultAsync(x => x.Id == notification.RequestId, cancellationToken: cancellationToken);
        if (request != null)
        {
            var mainRequest = await _mainContext.Requests
                .AsNoTrackingWithIdentityResolution()
                .FirstOrDefaultAsync(x => x.Id == notification.RequestId, cancellationToken: cancellationToken);
            request.CompanyId = newCompany.Id;
            request.LicenseDuration = mainRequest.LicenseDuration;
            request.LicenseId = mainRequest.LicenseId;
            request.Comments = mainRequest.Comments;
            request.Status = mainRequest.Status;
            request.ReviewedById = mainRequest.ReviewedById;
            request.ReviewedAt = mainRequest.ReviewedAt;
            request.UpdatedById = mainRequest.UpdatedById;

            _context.Update(request);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    private async
        Task<(Organization organization, User user, CompanyRegisterType companyRegisterType, UserRole predefinedRole)>
        PrepareNewCompanyData(Organization company, ApproveRequestNotification notification, RequestType requestType,
            CancellationToken cancellationToken)
    {
        var userId = notification.UserId;
        var newCompany = company.DeepClone();
        var user = await _mainContext.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .AsNoTrackingWithIdentityResolution()
            .FirstOrDefaultAsync(x => x.Id == notification.UserId, cancellationToken);
        var predefinedRole = user.UserRoles.FirstOrDefault(x => PredefinedUserGroups.IsPredefined(x.Role.Name));
        user.UserRoles = user.UserRoles.Where(x => !PredefinedUserGroups.IsPredefined(x.Role.Name)).ToList();
        user.UserRoles.ForEach(x => { x.User = null; });
        user.Organization = null;
        user.OrganizationId = null;
        user.Language = null;
        user.Municipality = null;
        user.Qualifications = null;
        user.EmploymentHistory = null;

        newCompany.ContactPersonId = userId;
        newCompany.ContactPerson = user;
        newCompany.Municipality = null;
        newCompany.Requests = null;
        newCompany.Qualifications = null;

        var branch = await _mainContext.CompanyBranches
            .AsNoTrackingWithIdentityResolution()
            .FirstOrDefaultAsync(x => x.Id == notification.CompanyBranchId, cancellationToken);
        if (branch is not null)
        {
            branch.Organization = null;
            branch.Equipments = null;
            branch.Municipality = null;
            newCompany.Branches = new List<CompanyBranch>() { branch };
        }

        // 4. Save company reg type
        //var companyType = requestType == RequestType.RegistrationOfOwnersAndOperators
        //    ? CompanyType.OwnerAndOperator
        //    : requestType == RequestType.RegistrationAndLicensingOfServiceCompanies
        //        ? CompanyType.ServiceCompanyEnterpreneur
        //        : CompanyType.ImporterExporter;

        var companyType = requestType == RequestType.RegistraterAsShipper
           ? CompanyType.Shipper
           : CompanyType.Carrier;
        var typeExists = await _context.CompanyRegisterTypes
            .AsNoTracking()
            .AnyAsync(x => x.OrganizationId == newCompany.Id && x.Type == companyType, cancellationToken);

        var companyRegType = await _mainContext.CompanyRegisterTypes
            .AsNoTrackingWithIdentityResolution()
            .FirstOrDefaultAsync(x => x.Id == notification.CompanyRegisterTypeId, cancellationToken);
        if (!typeExists)
        {
            if (companyRegType is not null)
            {
                companyRegType.Organization = null;
                newCompany.CompanyRegisterTypes = new List<CompanyRegisterType>() { companyRegType };
            }
        }
        else
        {
            companyRegType = null;
        }

        newCompany.CreatedBy = null;
        newCompany.UpdatedBy = null;

        if (await _context.UserRoles.AsNoTracking()
                .AnyAsync(x => x.UserId == userId && x.RoleId == predefinedRole.RoleId,
                    cancellationToken: cancellationToken))
        {
            predefinedRole = null;
        }

        return (newCompany, user, companyRegType, predefinedRole);
    }

    private async Task AssignCompanyToCertifiedTechnicians(Guid companyId, string? certificationNumbers,
        CancellationToken cancellationToken)
    {
        var certificationNumbersList = !string.IsNullOrEmpty(certificationNumbers)
            ? certificationNumbers.Split(new char[] { CertificationNumberDelimiter.Delimiter[0] }).ToList()
            : new();

        var technicianIds = _context.Qualifications
            .Where(x => certificationNumbersList.Contains(x.CertificateNumber))
            .Select(x => x.CertifiedTechnicianId)
            .ToList();

        var technicians = await _context.Users
            .Include(x => x.EmploymentHistory)
            .Where(x => technicianIds.Contains(x.Id))
            .ToListAsync(cancellationToken);

        foreach (var technician in technicians)
        {
            technician.UserRoles = null;
            technician.Organization = null;
            technician.Language = null;
            technician.Municipality = null;
            technician.Qualifications = null;
            technician.OrganizationId = companyId;
            technician.EmploymentHistory = new()
            {
                new Employment
                {
                    CertifiedTechnicianId = technician.Id,
                    CompanyId = companyId,
                    StartDate = DateTime.Now,
                }
            };

            _context.Users.Update(technician);
        }
    }
}

public class BetaApproveRequestHandler : GenericApproveRequestHandler<BetaDbContext>
{
    public BetaApproveRequestHandler(BetaDbContext context, IAppDbContext mainContext,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, mainContext, databaseHealthCheckService, failureLoggingService,
            nameof(BetaApproveRequestHandler))
    {
    }
}

public class GammaApproveRequestHandler : GenericApproveRequestHandler<GammaDbContext>
{
    public GammaApproveRequestHandler(GammaDbContext context, IAppDbContext mainContext,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, mainContext, databaseHealthCheckService, failureLoggingService,
            nameof(GammaApproveRequestHandler))
    {
    }
}

public class DeltaApproveRequestHandler : GenericApproveRequestHandler<DeltaDbContext>
{
    public DeltaApproveRequestHandler(DeltaDbContext context, IAppDbContext mainContext,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, mainContext, databaseHealthCheckService, failureLoggingService,
            nameof(DeltaApproveRequestHandler))
    {
    }
}