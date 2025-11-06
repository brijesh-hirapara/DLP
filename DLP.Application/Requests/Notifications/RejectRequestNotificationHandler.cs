using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Requests.Notifications;

public class RejectRequestNotificationHandler<TContext> : INotificationHandler<RejectRequestNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    public RejectRequestNotificationHandler(TContext context,
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _context = context;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(RejectRequestNotification notification, CancellationToken cancellationToken)
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

        var request = notification.Request;
        try
        {
            if (await _context.Requests.AnyAsync(x => x.Id == request.Id))
            {
                request.Attachments = null;
                request.CreatedById = SystemConstants.SystemUserId;
                //request.Municipality = null;
                request.Company = null;
                request.BusinessActivity = null;
                request.CreatedBy = null;
                request.UpdatedBy = null;
                _context.Requests.Update(request);
                await _context.SaveChangesAsync(cancellationToken);
                await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            request.Attachments = null;
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(RejectRequestNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.UPDATE,
            nameof(Request), cancellationToken);
    }
}

public class BetaRejectRequestNotificationHandler : RejectRequestNotificationHandler<BetaDbContext>
{
    public BetaRejectRequestNotificationHandler(BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService,
            nameof(BetaRejectRequestNotificationHandler))
    {
    }
}

public class GammaRejectRequestNotificationHandler : RejectRequestNotificationHandler<GammaDbContext>
{
    public GammaRejectRequestNotificationHandler(GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService,
            nameof(GammaRejectRequestNotificationHandler))
    {
    }
}

public class DeltaRejectRequestNotificationHandler : RejectRequestNotificationHandler<DeltaDbContext>
{
    public DeltaRejectRequestNotificationHandler(DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService,
            nameof(DeltaRejectRequestNotificationHandler))
    {
    }
}