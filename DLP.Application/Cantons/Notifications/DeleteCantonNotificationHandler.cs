using DLP.Application.Cantons.Notifications;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;

namespace DLP.Application.Cantons.NotificationHandlers;

public abstract class BaseDeleteCantonHandler<TContext> : INotificationHandler<DeleteCantonNotification>
    where TContext : DbContextBase
{
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly IEmailCommunicationService _emailService;
    private readonly TContext _context;
    private readonly string _handlerName;

    public BaseDeleteCantonHandler(
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

    public async Task Handle(DeleteCantonNotification notification, CancellationToken cancellationToken)
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

            var canton = _context.Cantons.Find(notification.Id) ??
                         throw new Exception("This Canton doesn't exist in the target database!");

            _context.Cantons.Remove(canton);
            await _context.SaveChangesAsync(cancellationToken);

            await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
            {
                CodebookName = "Canton => " + canton.Name,
                ActionType = Domain.Enums.CodebookActionEnum.DELETE
            }, _context, cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(DeleteCantonNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context,
            DbActions.DELETE, nameof(Canton), cancellationToken);
    }
}

public class BetaDeleteCantonHandler : BaseDeleteCantonHandler<BetaDbContext>
{
    public BetaDeleteCantonHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, IEmailCommunicationService emailService, BetaDbContext context)
        : base(healthCheckService, failureLoggingService, emailService, context, nameof(BetaDeleteCantonHandler))
    {
    }
}

public class GammaDeleteCantonHandler : BaseDeleteCantonHandler<GammaDbContext>
{
    public GammaDeleteCantonHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, IEmailCommunicationService emailService, GammaDbContext context)
        : base(healthCheckService, failureLoggingService, emailService, context, nameof(GammaDeleteCantonHandler))
    {
    }
}

public class DeltaDeleteCantonHandler : BaseDeleteCantonHandler<DeltaDbContext>
{
    public DeltaDeleteCantonHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, IEmailCommunicationService emailService, DeltaDbContext context)
        : base(healthCheckService, failureLoggingService, emailService, context, nameof(DeltaDeleteCantonHandler))
    {
    }
}