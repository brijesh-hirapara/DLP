using DLP.Application.Common.Constants;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using MoreLinq;

namespace DLP.Application.Organizations.Notifications;

public abstract class
    DeleteOrganizationNotificationHandler<TContext> : INotificationHandler<DeleteOrganizationNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    protected DeleteOrganizationNotificationHandler(TContext context,
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _context = context;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(DeleteOrganizationNotification notification, CancellationToken cancellationToken)
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

        try
        {
            var organization = await _context.Organizations.IgnoreAutoIncludes()
                                   .FirstOrDefaultAsync(x => x.Id == notification.OrganizationId, cancellationToken)
                               ?? throw new NotFoundException(
                                   $"Organization with ID {notification.OrganizationId} not found.");

            organization.IsDeleted = true;

            var employees = _context.Users.IgnoreAutoIncludes().Where(x => x.OrganizationId == organization.Id);
            employees.ForEach(user =>
            {
                user.IsActive = false;
                user.Municipality = null;
                user.Language = null;
                user.Qualifications = null;
                user.EmploymentHistory = null;
                user.Organization = null;
                user.UserRoles = null;
            });
            _context.Users.UpdateRange(employees);
            _context.Organizations.Update(organization);
            await _context.SaveChangesAsync(cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(DeleteOrganizationNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.DELETE,
            nameof(Organization), cancellationToken);
    }
}

public class BetaDeleteOrganizationNotificationHandler : DeleteOrganizationNotificationHandler<BetaDbContext>
{
    public BetaDeleteOrganizationNotificationHandler(BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService,
            nameof(BetaDeleteOrganizationNotificationHandler))
    {
    }
}

public class GammaDeleteOrganizationNotificationHandler : DeleteOrganizationNotificationHandler<GammaDbContext>
{
    public GammaDeleteOrganizationNotificationHandler(GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService,
            nameof(GammaDeleteOrganizationNotificationHandler))
    {
    }
}

public class DeltaDeleteOrganizationNotificationHandler : DeleteOrganizationNotificationHandler<DeltaDbContext>
{
    public DeltaDeleteOrganizationNotificationHandler(DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService,
            nameof(DeltaDeleteOrganizationNotificationHandler))
    {
    }
}