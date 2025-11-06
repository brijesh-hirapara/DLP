using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.Notifications.Notifications;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Languages.Notifications;

public class LanguageDeleteHandlerBase<TContext> : INotificationHandler<DeleteLanguageNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    protected LanguageDeleteHandlerBase(TContext context,
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _context = context;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(DeleteLanguageNotification notification, CancellationToken cancellationToken)
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

            var existingLanguages = _context.Languages.Include(r => r.Translations).ToList();
            var defaultLanguageId = existingLanguages.First(x => x.IsDefault).Id;
            var requestActionLanguage = existingLanguages.FirstOrDefault(r => r.Id == notification.Id);

            if (requestActionLanguage != null)
            {
                // Replace language for users who have the language to be deleted with the default language
                await _context.Users.Where(z => z.LanguageId == notification.Id)
                    .ForEachAsync(user => user.LanguageId = defaultLanguageId, cancellationToken);

                _context.Languages.Remove(requestActionLanguage);
                await _context.SaveChangesAsync(cancellationToken);
                await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(DeleteLanguageNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.DELETE,
            nameof(Language), cancellationToken);
    }
}

public class BetaDeleteLanguageHandler : LanguageDeleteHandlerBase<BetaDbContext>
{
    public BetaDeleteLanguageHandler(BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(BetaDeleteLanguageHandler))
    {
    }
}

public class GammaDeleteLanguageHandler : LanguageDeleteHandlerBase<GammaDbContext>
{
    public GammaDeleteLanguageHandler(GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(GammaDeleteLanguageHandler))
    {
    }
}

public class DeltaDeleteLanguageHandler : LanguageDeleteHandlerBase<DeltaDbContext>
{
    public DeltaDeleteLanguageHandler(DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(DeltaDeleteLanguageHandler))
    {
    }
}