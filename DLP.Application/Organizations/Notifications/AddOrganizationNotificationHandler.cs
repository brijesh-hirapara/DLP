using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using DLP.Application.Common.Extensions;

namespace DLP.Application.Organizations.Notifications;

public abstract class AddOrganizationNotificationHandler<TContext> : INotificationHandler<AddOrganizationNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IAppDbContext _mainContext;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    protected AddOrganizationNotificationHandler(TContext context,
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


    public async Task Handle(AddOrganizationNotification notification, CancellationToken cancellationToken)
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

        if (notification.OrganizationType != OrganizationTypeEnum.INSTITUTION)
        {
            return;
        }

        var organization = await _mainContext.Organizations
            .AsNoTrackingWithIdentityResolution()
            .FirstOrDefaultAsync(x => x.Id == notification.OrganizationId, cancellationToken);

        organization.ContactPerson = null;
        organization.ContactPersonId = null;
        organization.Municipality = null;
        organization.Employees = null;
        try
        {
            await _context.Organizations.AddAsync(organization, cancellationToken);

            var _user = await _mainContext.Users
                .IgnoreAutoIncludes()
                .Include(x => x.UserRoles)
                .ThenInclude(x => x.Role)
                .ThenInclude(x => x.Claims)
                .FirstOrDefaultAsync(x => x.Id == notification.UserId, cancellationToken);

            var user = _user.DeepClone();
            var roles = user.UserRoles
                .Where(x => !PredefinedUserGroups.IsPredefined(x.Role?.Name))
                .ToList();
            var userRoles = roles
                .Select(x => new UserRole { UserId = x.UserId, RoleId = x.RoleId, Role = null, User = null })
                .ToList();

            await _context.SaveChangesAsync(cancellationToken);
            user.Municipality = null;
            user.Language = null;
            user.Qualifications = null;
            user.EmploymentHistory = null;
            user.Organization = null;
            user.UserRoles = null;
            user.CreatedById = SystemConstants.SystemUserId;
            user.OrganizationId = organization.Id;
            await _context.Users.AddAsync(user, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            organization.ContactPersonId = user.Id;
            _context.Organizations.Update(organization);
            await _context.SaveChangesAsync(cancellationToken);

            foreach (var role in roles)
            {
                if (role.Role != null &&
                    !await _context.Roles.AnyAsync(x => x.Id == role.Role.Id, cancellationToken: cancellationToken))
                {
                    var newRole = role.Role;
                    newRole.UserRoles = null;
                    newRole.CreatedBy = null;
                    newRole.CreatedById = SystemConstants.SystemUserId;
                    newRole.Claims = newRole.Claims.Select(x => new RoleClaim
                    {
                        ClaimType = x.ClaimType,
                        ClaimValue = x.ClaimValue,
                    }).ToList();
                    _context.Roles.Add(newRole);
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            await _context.UserRoles.AddRangeAsync(userRoles, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(AddOrganizationNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.ADD,
            nameof(Organization), cancellationToken);
    }
}

public class BetaAddOrganizationNotificationHandler : AddOrganizationNotificationHandler<BetaDbContext>
{
    public BetaAddOrganizationNotificationHandler(BetaDbContext context, IAppDbContext mainContext,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, mainContext, databaseHealthCheckService, failureLoggingService,
            nameof(BetaAddOrganizationNotificationHandler))
    {
    }
}

public class GammaAddOrganizationNotificationHandler : AddOrganizationNotificationHandler<GammaDbContext>
{
    public GammaAddOrganizationNotificationHandler(GammaDbContext context, IAppDbContext mainContext,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, mainContext, databaseHealthCheckService, failureLoggingService,
            nameof(GammaAddOrganizationNotificationHandler))
    {
    }
}

public class DeltaAddOrganizationNotificationHandler : AddOrganizationNotificationHandler<DeltaDbContext>
{
    public DeltaAddOrganizationNotificationHandler(DeltaDbContext context, IAppDbContext mainContext,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, mainContext, databaseHealthCheckService, failureLoggingService,
            nameof(DeltaAddOrganizationNotificationHandler))
    {
    }
}