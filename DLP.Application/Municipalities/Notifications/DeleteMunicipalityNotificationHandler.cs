using MediatR;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Application.Common.Templates.Models;
using DLP.Application.Municipalities.NotificationModels;
using DLP.Domain.Entities;
using DLP.Application.Common.Constants;
using DLP.Domain.Enums;

namespace DLP.Application.Municipalities.NotificationHandlers;

public class MunicipalityDeleteHandlerBase<TContext> : INotificationHandler<DeleteMunicipalityNotification>
    where TContext : DbContextBase
{
    private readonly IEmailCommunicationService _emailService;
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    protected MunicipalityDeleteHandlerBase(IEmailCommunicationService emailService,
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

    public async Task Handle(DeleteMunicipalityNotification notification, CancellationToken cancellationToken)
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

            var municipality = await _context.Set<Municipality>()
                .FindAsync(new object?[] { notification.Id }, cancellationToken: cancellationToken);
            if (municipality != null)
            {
                _context.Set<Municipality>().Remove(municipality);
                await _context.SaveChangesAsync(cancellationToken);

                await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
                {
                    CodebookName = "Municipality => " + municipality.Name,
                    ActionType = CodebookActionEnum.DELETE
                }, _context, cancellationToken);
                await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(DeleteMunicipalityNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.DELETE,
            nameof(Municipality), cancellationToken);
    }
}

public class BetaDeleteMunicipalityHandler : MunicipalityDeleteHandlerBase<BetaDbContext>
{
    public BetaDeleteMunicipalityHandler(IEmailCommunicationService emailService, BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(emailService, context, databaseHealthCheckService, failureLoggingService,
            nameof(BetaDeleteMunicipalityHandler))
    {
    }
}

public class GammaDeleteMunicipalityHandler : MunicipalityDeleteHandlerBase<GammaDbContext>
{
    public GammaDeleteMunicipalityHandler(IEmailCommunicationService emailService, GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(emailService, context, databaseHealthCheckService, failureLoggingService,
            nameof(GammaDeleteMunicipalityHandler))
    {
    }
}

public class DeltaDeleteMunicipalityHandler : MunicipalityDeleteHandlerBase<DeltaDbContext>
{
    public DeltaDeleteMunicipalityHandler(IEmailCommunicationService emailService, DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(emailService, context, databaseHealthCheckService, failureLoggingService,
            nameof(DeltaDeleteMunicipalityHandler))
    {
    }
}