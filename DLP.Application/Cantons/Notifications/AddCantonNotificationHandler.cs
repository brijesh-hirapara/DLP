using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Domain.Entities;
using MediatR;
using DLP.Application.Cantons.Notifications;
using DLP.Application.Common.Constants;
using DLP.Application.OtherContexts;

namespace DLP.Application.Cantons.NotificationHandlers;

public abstract class BaseAddCantonHandler<TContext> : INotificationHandler<AddCantonNotification>
    where TContext : DbContextBase
{
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly IEmailCommunicationService _emailService;
    private readonly DbContextBase _context;
    private readonly string _handlerName;

    public BaseAddCantonHandler(
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        IEmailCommunicationService emailService,
        TContext context,
        string handlerName)
    {
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _emailService = emailService;
        _context = context;
        _handlerName = handlerName;
    }

    public async Task Handle(AddCantonNotification notification, CancellationToken cancellationToken)
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

            _context.Cantons.Add(notification.Canton);
            await _context.SaveChangesAsync(cancellationToken);

            await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
            {
                CodebookName = "Canton => " + notification.Canton.Name,
                ActionType = Domain.Enums.CodebookActionEnum.ADD
            }, _context, cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(AddCantonNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.ADD,
            nameof(Canton), cancellationToken);
    }
}

public class BetaAddCantonHandler : BaseAddCantonHandler<BetaDbContext>
{
    public BetaAddCantonHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, IEmailCommunicationService emailService, BetaDbContext context)
        : base(healthCheckService, failureLoggingService, emailService, context, nameof(BetaAddCantonHandler))
    {
    }
}

public class GammaAddCantonHandler : BaseAddCantonHandler<GammaDbContext>
{
    public GammaAddCantonHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, IEmailCommunicationService emailService, GammaDbContext context)
        : base(healthCheckService, failureLoggingService, emailService, context, nameof(GammaAddCantonHandler))
    {
    }
}

public class DeltaAddCantonHandler : BaseAddCantonHandler<DeltaDbContext>
{
    public DeltaAddCantonHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, IEmailCommunicationService emailService, DeltaDbContext context)
        : base(healthCheckService, failureLoggingService, emailService, context, nameof(DeltaAddCantonHandler))
    {
    }
}