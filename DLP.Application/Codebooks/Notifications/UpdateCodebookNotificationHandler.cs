using DLP.Application.Codebooks.NotificationModels;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;

namespace DLP.Application.Codebooks.NotificationHandler;

public abstract class CodebookHandlerBase<TContext> : INotificationHandler<UpdateCodebookNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IEmailCommunicationService _emailService;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    protected CodebookHandlerBase(
        TContext context,
        IEmailCommunicationService emailService,
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _emailService = emailService;
        _context = context;
        _handlerName = handlerName;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
    }

    public async Task Handle(UpdateCodebookNotification notification, CancellationToken cancellationToken)
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

            notification.Codebook.UpdatedById = SystemConstants.SystemUserId;
            _context.Set<Codebook>().Update(notification.Codebook);
            await _context.SaveChangesAsync(cancellationToken);

            await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
            {
                ActionType = notification.Action,
                CodebookName = notification.Codebook.Name
            }, _context, cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(UpdateCodebookNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        var action = notification.Action == Domain.Enums.CodebookActionEnum.UPDATE
            ? DbActions.UPDATE
            : DbActions.DELETE;
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, action,
            nameof(Codebook), cancellationToken);
    }
}

public class BetaUpdateCodebookHandler : CodebookHandlerBase<BetaDbContext>
{
    public BetaUpdateCodebookHandler(BetaDbContext context, IEmailCommunicationService emailService,
        IDatabaseHealthCheckService healthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, emailService, healthCheckService, failureLoggingService, nameof(BetaUpdateCodebookHandler))
    {
    }
}

public class GammaUpdateCodebookHandler : CodebookHandlerBase<GammaDbContext>
{
    public GammaUpdateCodebookHandler(GammaDbContext context, IEmailCommunicationService emailService,
        IDatabaseHealthCheckService healthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, emailService, healthCheckService, failureLoggingService, nameof(GammaUpdateCodebookHandler))
    {
    }
}

public class DeltaUpdateCodebookHandler : CodebookHandlerBase<DeltaDbContext>
{
    public DeltaUpdateCodebookHandler(DeltaDbContext context, IEmailCommunicationService emailService,
        IDatabaseHealthCheckService healthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, emailService, healthCheckService, failureLoggingService, nameof(DeltaUpdateCodebookHandler))
    {
    }
}