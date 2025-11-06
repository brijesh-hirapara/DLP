using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.OtherContexts;
using DLP.Application.RefrigerantTypes.Notifications;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.Handlers;

public abstract class
    UpdateRefrigerantTypeHandlerBase<TContext> : INotificationHandler<UpdateRefrigerantTypeNotification>
    where TContext : DbContextBase
{
    private readonly IEmailCommunicationService _emailService;
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    protected UpdateRefrigerantTypeHandlerBase(IEmailCommunicationService emailService,
        TContext context,
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _emailService = emailService;
        _context = context;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(UpdateRefrigerantTypeNotification notification, CancellationToken cancellationToken)
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

            notification.RefrigerantType.UpdatedById = SystemConstants.SystemUserId;
            _context.RefrigerantTypes.Update(notification.RefrigerantType);

            await _context.SaveChangesAsync(cancellationToken);

            await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
            {
                ActionType = notification.Action,
                CodebookName = notification.RefrigerantType.Name
            }, _context, cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(UpdateRefrigerantTypeNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        var action = notification.Action == CodebookActionEnum.ADD
            ? DbActions.ADD
            : DbActions.UPDATE;
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, action,
            nameof(RefrigerantType), cancellationToken);
    }
}

public class BetaUpdateRefrigerantTypeHandler : UpdateRefrigerantTypeHandlerBase<BetaDbContext>
{
    public BetaUpdateRefrigerantTypeHandler(IEmailCommunicationService emailService, BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(emailService, context, databaseHealthCheckService, failureLoggingService,
            nameof(BetaUpdateRefrigerantTypeHandler))
    {
    }
}

public class GammaUpdateRefrigerantTypeHandler : UpdateRefrigerantTypeHandlerBase<GammaDbContext>
{
    public GammaUpdateRefrigerantTypeHandler(IEmailCommunicationService emailService, GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(emailService, context, databaseHealthCheckService, failureLoggingService,
            nameof(GammaUpdateRefrigerantTypeHandler))
    {
    }
}

public class DeltaUpdateRefrigerantTypeHandler : UpdateRefrigerantTypeHandlerBase<DeltaDbContext>
{
    public DeltaUpdateRefrigerantTypeHandler(IEmailCommunicationService emailService, DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(emailService, context, databaseHealthCheckService, failureLoggingService,
            nameof(DeltaUpdateRefrigerantTypeHandler))
    {
    }
}