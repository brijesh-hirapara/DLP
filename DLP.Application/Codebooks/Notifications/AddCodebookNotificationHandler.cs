using DLP.Application.Codebooks.NotificationModels;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.Codebooks.NotificationHandler;

public abstract class GenericAddCodebookHandler<TContext> : INotificationHandler<AddCodebookNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IEmailCommunicationService _emailService;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    public GenericAddCodebookHandler(
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

    public async Task Handle(AddCodebookNotification notification, CancellationToken cancellationToken)
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

            notification.Codebook.CreatedById = SystemConstants.SystemUserId;
            _context.Codebooks.Add(notification.Codebook);
            await _context.SaveChangesAsync(cancellationToken);
            await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
            {
                ActionType = CodebookActionEnum.ADD,
                CodebookName = notification.Codebook.Name
            }, _context, cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(AddCodebookNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.ADD,
            nameof(Codebook), cancellationToken);
    }
}

public class BetaAddCodebookHandler : GenericAddCodebookHandler<BetaDbContext>
{
    public BetaAddCodebookHandler(BetaDbContext context, IEmailCommunicationService emailService,
        IDatabaseHealthCheckService healthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, emailService, healthCheckService, failureLoggingService, nameof(BetaAddCodebookHandler))
    {
    }
}

public class GammaAddCodebookHandler : GenericAddCodebookHandler<GammaDbContext>
{
    public GammaAddCodebookHandler(GammaDbContext context, IEmailCommunicationService emailService,
        IDatabaseHealthCheckService healthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, emailService, healthCheckService, failureLoggingService, nameof(GammaAddCodebookHandler))
    {
    }
}

public class DeltaAddCodebookHandler : GenericAddCodebookHandler<DeltaDbContext>
{
    public DeltaAddCodebookHandler(DeltaDbContext context, IEmailCommunicationService emailService,
        IDatabaseHealthCheckService healthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, emailService, healthCheckService, failureLoggingService, nameof(DeltaAddCodebookHandler))
    {
    }
}