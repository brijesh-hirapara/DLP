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
    CreateRefrigerantTypeHandlerBase<TContext> : INotificationHandler<AddRefrigerantTypeNotification>
    where TContext : DbContextBase
{
    private readonly IEmailCommunicationService _emailService;
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    protected CreateRefrigerantTypeHandlerBase(IEmailCommunicationService emailService,
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

    public async Task Handle(AddRefrigerantTypeNotification notification, CancellationToken cancellationToken)
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

            notification.RefrigerantType.CreatedById = SystemConstants.SystemUserId;
            await _context.Set<RefrigerantType>().AddAsync(notification.RefrigerantType, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
            {
                ActionType = CodebookActionEnum.ADD,
                CodebookName = notification.RefrigerantType.Name
            }, _context, cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(AddRefrigerantTypeNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.ADD,
            nameof(RefrigerantType), cancellationToken);
    }
}

public class BetaCreateRefrigerantTypeHandler : CreateRefrigerantTypeHandlerBase<BetaDbContext>
{
    public BetaCreateRefrigerantTypeHandler(IEmailCommunicationService emailService, BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(emailService, context, databaseHealthCheckService, failureLoggingService,
            nameof(BetaCreateRefrigerantTypeHandler))
    {
    }
}

public class GammaCreateRefrigerantTypeHandler : CreateRefrigerantTypeHandlerBase<GammaDbContext>
{
    public GammaCreateRefrigerantTypeHandler(IEmailCommunicationService emailService, GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(emailService, context, databaseHealthCheckService, failureLoggingService,
            nameof(GammaCreateRefrigerantTypeHandler))
    {
    }
}

public class DeltaCreateRefrigerantTypeHandler : CreateRefrigerantTypeHandlerBase<DeltaDbContext>
{
    public DeltaCreateRefrigerantTypeHandler(IEmailCommunicationService emailService, DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(emailService, context, databaseHealthCheckService, failureLoggingService,
            nameof(DeltaCreateRefrigerantTypeHandler))
    {
    }
}