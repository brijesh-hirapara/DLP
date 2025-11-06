using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;

namespace DLP.Application.Users.Notifications;

public class ActivateUserNotificationHandler<TContext> : INotificationHandler<ActivateUserNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    public ActivateUserNotificationHandler(TContext context,
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _context = context;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(ActivateUserNotification notification, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrEmpty(notification.SpecificHandlerOnly) &&
            notification.SpecificHandlerOnly != _handlerName)
            return;

        try
        {
            var isDatabaseAvailable = await _healthCheckService.IsDatabaseAvailable<TContext>();
            if (!isDatabaseAvailable)
            {
                await LogFailedSynchronization(notification, new Exception("Database is unavailable"),
                    cancellationToken);
                return;
            }

            var user = await _context.Users.FindAsync(new object?[] { notification.UserId, cancellationToken },
                cancellationToken: cancellationToken);
            if (user is null)
            {
                return;
            }

            user.PasswordHash = notification.PasswordHash;
            user.MustChangePassword = false;
            user.IsActive = true;
            _context.Users.Update(user);
            await _context.SaveChangesAsync(cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(ActivateUserNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.UPDATE,
            nameof(User), cancellationToken);
    }
}

public class BetaActivateUserHandler : ActivateUserNotificationHandler<BetaDbContext>
{
    public BetaActivateUserHandler(BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService,
            nameof(BetaActivateUserHandler))
    {
    }
}

public class GammaActivateUserHandler : ActivateUserNotificationHandler<GammaDbContext>
{
    public GammaActivateUserHandler(GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService,
            nameof(GammaActivateUserHandler))
    {
    }
}

public class DeltaActivateUserHandler : ActivateUserNotificationHandler<DeltaDbContext>
{
    public DeltaActivateUserHandler(DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService,
            nameof(DeltaActivateUserHandler))
    {
    }
}