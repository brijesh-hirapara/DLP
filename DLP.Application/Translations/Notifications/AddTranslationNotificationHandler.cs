using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Translations.Notifications;

public class CreateTranslationHandlerBase<TContext> : INotificationHandler<AddTranslationNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    public CreateTranslationHandlerBase(TContext context,
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _context = context;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(AddTranslationNotification notification, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrEmpty(notification.SpecificHandlerOnly) &&
            notification.SpecificHandlerOnly != _handlerName)
            return;

        var isDatabaseAvailable = await _healthCheckService.IsDatabaseAvailable<TContext>();
        if (!isDatabaseAvailable)
        {
            await LogFailedSynchronization(notification, new Exception("Database is unavailable"),
                cancellationToken);
            return;
        }

        try
        {
            notification.Translation.Language = null;
            if (!await _context.Translations.AnyAsync(x =>
                    x.Key == notification.Translation.Key && x.LanguageId == notification.Translation.LanguageId))
            {
                await _context.Set<Translation>().AddAsync(notification.Translation, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);
                await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(AddTranslationNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.ADD,
            nameof(Translation), cancellationToken);
    }
}

public class BetaCreateTranslationHandler : CreateTranslationHandlerBase<BetaDbContext>
{
    public BetaCreateTranslationHandler(BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService,
            nameof(BetaCreateTranslationHandler))
    {
    }
}

public class GammaCreateTranslationHandler : CreateTranslationHandlerBase<GammaDbContext>
{
    public GammaCreateTranslationHandler(GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService,
            nameof(GammaCreateTranslationHandler))
    {
    }
}

public class DeltaCreateTranslationHandler : CreateTranslationHandlerBase<DeltaDbContext>
{
    public DeltaCreateTranslationHandler(DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService,
            nameof(DeltaCreateTranslationHandler))
    {
    }
}