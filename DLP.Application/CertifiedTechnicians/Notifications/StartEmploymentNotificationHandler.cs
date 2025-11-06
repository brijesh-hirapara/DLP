using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;

namespace DLP.Application.CertifiedTechnicians.Notifications;

public abstract class StartEmploymentNotificationHandler<TContext> : INotificationHandler<StartEmploymentNotification>
    where TContext : DbContextBase
{
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly TContext _context;
    private readonly string _handlerName;

    public StartEmploymentNotificationHandler(
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        TContext context,
        string handlerName)
    {
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _context = context;
        _handlerName = handlerName;
    }

    public async Task Handle(StartEmploymentNotification notification, CancellationToken cancellationToken)
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

            var toInsertData = new List<Employment>();
            notification.Employments.ForEach(item =>
            {
                toInsertData.Add(new Employment
                {
                    Id = item.Id,
                    StartDate = item.StartDate,
                    EndDate = item.EndDate,
                    CertifiedTechnicianId = item.CertifiedTechnicianId,
                    CompanyId = item.CompanyId,
                });
            });

            await _context.EmploymentHistory.AddRangeAsync(toInsertData, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(StartEmploymentNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.ADD,
            nameof(Employment), cancellationToken);
    }
}

public class BetaStartEmploymentNotificationHandler : StartEmploymentNotificationHandler<BetaDbContext>
{
    public BetaStartEmploymentNotificationHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, BetaDbContext context)
        : base(healthCheckService, failureLoggingService, context, nameof(BetaStartEmploymentNotificationHandler))
    {
    }
}

public class GammaStartEmploymentNotificationHandler : StartEmploymentNotificationHandler<GammaDbContext>
{
    public GammaStartEmploymentNotificationHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, GammaDbContext context)
        : base(healthCheckService, failureLoggingService, context, nameof(GammaStartEmploymentNotificationHandler))
    {
    }
}

public class DeltaStartEmploymentNotificationHandler : StartEmploymentNotificationHandler<DeltaDbContext>
{
    public DeltaStartEmploymentNotificationHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, DeltaDbContext context)
        : base(healthCheckService, failureLoggingService, context, nameof(DeltaStartEmploymentNotificationHandler))
    {
    }
}