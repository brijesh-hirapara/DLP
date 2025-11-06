using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using MediatR;
using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.CertifiedTechnicians.Notifications;

public abstract class EndEmploymentNotificationHandler<TContext> : INotificationHandler<EndEmploymentNotification>
    where TContext : DbContextBase
{
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly TContext _context;
    private readonly string _handlerName;

    public EndEmploymentNotificationHandler(
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

    public async Task Handle(EndEmploymentNotification notification, CancellationToken cancellationToken)
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

            var technican = await _context.Users
                                .Include(x => x.EmploymentHistory)
                                .FirstOrDefaultAsync(x => x.Id == notification.UserId, cancellationToken) ??
                            throw new Exception("Technician in the target database doesn't exist!");

            var employmentHistory = technican.EmploymentHistory
                                        .SingleOrDefault(x => !x.EndDate.HasValue)
                                    ?? throw new Exception("No record of the Employment History");

            employmentHistory.EndDate = notification.EndDate;
            technican.OrganizationId = null;

            _context.Users.Update(technican);
            await _context.SaveChangesAsync(cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            await _context.Database.RollbackTransactionAsync(cancellationToken);
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(EndEmploymentNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.UPDATE,
            nameof(Employment), cancellationToken);
    }
}

public class BetaEndEmploymentNotificationHandler : EndEmploymentNotificationHandler<BetaDbContext>
{
    public BetaEndEmploymentNotificationHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, BetaDbContext context)
        : base(healthCheckService, failureLoggingService, context, nameof(BetaEndEmploymentNotificationHandler))
    {
    }
}

public class GammaEndEmploymentNotificationHandler : EndEmploymentNotificationHandler<GammaDbContext>
{
    public GammaEndEmploymentNotificationHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, GammaDbContext context)
        : base(healthCheckService, failureLoggingService, context, nameof(GammaEndEmploymentNotificationHandler))
    {
    }
}

public class DeltaEndEmploymentNotificationHandler : EndEmploymentNotificationHandler<DeltaDbContext>
{
    public DeltaEndEmploymentNotificationHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, DeltaDbContext context)
        : base(healthCheckService, failureLoggingService, context, nameof(DeltaEndEmploymentNotificationHandler))
    {
    }
}