using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.Municipalities.NotificationModels;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.Municipalities.NotificationHandlers;

public class MunicipalityHandlerBase<TContext> : INotificationHandler<AddMunicipalityNotification>
    where TContext : DbContextBase
{
    private readonly IEmailCommunicationService _emailService;
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    protected MunicipalityHandlerBase(IEmailCommunicationService emailService,
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

    public async Task Handle(AddMunicipalityNotification notification, CancellationToken cancellationToken)
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

            _context.Set<Municipality>().Add(notification.Municipality);
            await _context.SaveChangesAsync(cancellationToken);

            await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
            {
                CodebookName = "Municipality => " + notification.Municipality.Name,
                ActionType = CodebookActionEnum.ADD
            }, _context, cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(AddMunicipalityNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.ADD,
            nameof(Municipality), cancellationToken);
    }
}

public class BetaAddMunicipalityHandler : MunicipalityHandlerBase<BetaDbContext>
{
    public BetaAddMunicipalityHandler(IEmailCommunicationService emailService, BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(emailService, context, databaseHealthCheckService, failureLoggingService,
            nameof(BetaAddMunicipalityHandler))
    {
    }
}

public class GammaAddMunicipalityHandler : MunicipalityHandlerBase<GammaDbContext>
{
    public GammaAddMunicipalityHandler(IEmailCommunicationService emailService, GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(emailService, context, databaseHealthCheckService, failureLoggingService,
            nameof(GammaAddMunicipalityHandler))
    {
    }
}

public class DeltaAddMunicipalityHandler : MunicipalityHandlerBase<DeltaDbContext>
{
    public DeltaAddMunicipalityHandler(IEmailCommunicationService emailService, DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(emailService, context, databaseHealthCheckService, failureLoggingService,
            nameof(DeltaAddMunicipalityHandler))
    {
    }
}