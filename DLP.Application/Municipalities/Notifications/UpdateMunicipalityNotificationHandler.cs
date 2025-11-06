using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.Municipalities.NotificationModels;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;

namespace DLP.Application.Municipalities.NotificationHandlers;

public class MunicipalityUpdateHandlerBase<TContext> : INotificationHandler<UpdateMunicipalityNotification>
    where TContext : DbContextBase
{
    private readonly IEmailCommunicationService _emailService;
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    protected MunicipalityUpdateHandlerBase(IEmailCommunicationService emailService,
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

    public async Task Handle(UpdateMunicipalityNotification notification, CancellationToken cancellationToken)
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

            _context.Set<Municipality>().Update(notification.Municipality);
            await _context.SaveChangesAsync(cancellationToken);

            await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
            {
                CodebookName = "Municipality => " + notification.Municipality.Name,
                ActionType = Domain.Enums.CodebookActionEnum.UPDATE
            }, _context, cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(UpdateMunicipalityNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.UPDATE,
            nameof(Municipality), cancellationToken);
    }
}

public class BetaUpdateMunicipalityNotificationHandler : MunicipalityUpdateHandlerBase<BetaDbContext>
{
    public BetaUpdateMunicipalityNotificationHandler(IEmailCommunicationService emailService, BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(emailService, context, databaseHealthCheckService, failureLoggingService,
            nameof(BetaUpdateMunicipalityNotificationHandler))
    {
    }
}

public class GammaUpdateMunicipalityNotificationHandler : MunicipalityUpdateHandlerBase<GammaDbContext>
{
    public GammaUpdateMunicipalityNotificationHandler(IEmailCommunicationService emailService, GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(emailService, context, databaseHealthCheckService, failureLoggingService,
            nameof(GammaUpdateMunicipalityNotificationHandler))
    {
    }
}

public class DeltaUpdateMunicipalityNotificationHandler : MunicipalityUpdateHandlerBase<DeltaDbContext>
{
    public DeltaUpdateMunicipalityNotificationHandler(IEmailCommunicationService emailService, DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(emailService, context, databaseHealthCheckService, failureLoggingService,
            nameof(DeltaUpdateMunicipalityNotificationHandler))
    {
    }
}