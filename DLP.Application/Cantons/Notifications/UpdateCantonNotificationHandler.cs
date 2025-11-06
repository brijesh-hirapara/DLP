using DLP.Application.Cantons.Notifications;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;

namespace DLP.Application.Cantons.NotificationHandlers;

public abstract class BaseUpdateCantonHandler<TContext> : INotificationHandler<UpdateCantonNotification>
    where TContext : DbContextBase
{
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly IEmailCommunicationService _emailService;
    private readonly IAppDbContext _mainContext;
    private readonly TContext _context;
    private readonly string _handlerName;

    public BaseUpdateCantonHandler(
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        IEmailCommunicationService emailService,
        TContext context,
        IAppDbContext mainContext,
        string handlerName)
    {
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _emailService = emailService;
        _context = context;
        _mainContext = mainContext;
        _handlerName = handlerName;
    }

    public async Task Handle(UpdateCantonNotification notification, CancellationToken cancellationToken)
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

            _context.Cantons.Update(notification.Canton);
            await _context.SaveChangesAsync(cancellationToken);

            await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
            {
                CodebookName = "Canton => " + notification.Canton.Name,
                ActionType = Domain.Enums.CodebookActionEnum.UPDATE
            }, _context, cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(UpdateCantonNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context,
            DbActions.UPDATE, nameof(Canton), cancellationToken);
    }
}

public class BetaUpdateCantonHandler : BaseUpdateCantonHandler<BetaDbContext>
{
    public BetaUpdateCantonHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, IEmailCommunicationService emailService, BetaDbContext context,
        IAppDbContext mainContext)
        : base(healthCheckService, failureLoggingService, emailService, context, mainContext,
            nameof(BetaUpdateCantonHandler))
    {
    }
}

public class GammaUpdateCantonHandler : BaseUpdateCantonHandler<GammaDbContext>
{
    public GammaUpdateCantonHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, IEmailCommunicationService emailService, GammaDbContext context,
        IAppDbContext mainContext)
        : base(healthCheckService, failureLoggingService, emailService, context, mainContext,
            nameof(GammaUpdateCantonHandler))
    {
    }
}

public class DeltaUpdateCantonHandler : BaseUpdateCantonHandler<DeltaDbContext>
{
    public DeltaUpdateCantonHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, IEmailCommunicationService emailService, DeltaDbContext context,
        IAppDbContext mainContext)
        : base(healthCheckService, failureLoggingService, emailService, context, mainContext,
            nameof(DeltaUpdateCantonHandler))
    {
    }
}