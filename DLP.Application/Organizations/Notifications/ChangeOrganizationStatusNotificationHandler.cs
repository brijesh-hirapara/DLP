using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Organizations.Notifications;

public abstract class
    ChangeOrganizationStatusNotificationHandler<TContext> : INotificationHandler<ChangeOrganizationStatusNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IAppDbContext _mainContext;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    public ChangeOrganizationStatusNotificationHandler(TContext context,
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

    public async Task Handle(ChangeOrganizationStatusNotification notification, CancellationToken cancellationToken)
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
            var mainOrganization = await _mainContext.Organizations
                .AsNoTrackingWithIdentityResolution()
                .FirstOrDefaultAsync(x => x.Id == notification.OrganizationId, cancellationToken);
            var organization = await _context.Organizations
                .AsNoTrackingWithIdentityResolution()
                .FirstOrDefaultAsync(x => x.Id == notification.OrganizationId, cancellationToken);

            if (organization != null)
            {
                organization.Status = mainOrganization.Status;
                organization.UpdatedAt = DateTime.Now;
                organization.UpdatedById = mainOrganization.UpdatedById;
                _context.Organizations.Update(organization);
                await _context.SaveChangesAsync(cancellationToken);
                await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(ChangeOrganizationStatusNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.UPDATE,
            nameof(Organization), cancellationToken);
    }
}

public class
    BetaChangeOrganizationStatusNotificationHandler : ChangeOrganizationStatusNotificationHandler<BetaDbContext>
{
    public BetaChangeOrganizationStatusNotificationHandler(BetaDbContext context, IAppDbContext mainContext,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, mainContext, databaseHealthCheckService, failureLoggingService,
            nameof(BetaChangeOrganizationStatusNotificationHandler))
    {
    }
}

public class
    GammaChangeOrganizationStatusNotificationHandler : ChangeOrganizationStatusNotificationHandler<GammaDbContext>
{
    public GammaChangeOrganizationStatusNotificationHandler(GammaDbContext context, IAppDbContext mainContext,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, mainContext, databaseHealthCheckService, failureLoggingService,
            nameof(GammaChangeOrganizationStatusNotificationHandler))
    {
    }
}

public class
    DeltaChangeOrganizationStatusNotificationHandler : ChangeOrganizationStatusNotificationHandler<DeltaDbContext>
{
    public DeltaChangeOrganizationStatusNotificationHandler(DeltaDbContext context, IAppDbContext mainContext,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, mainContext, databaseHealthCheckService, failureLoggingService,
            nameof(DeltaChangeOrganizationStatusNotificationHandler))
    {
    }
}