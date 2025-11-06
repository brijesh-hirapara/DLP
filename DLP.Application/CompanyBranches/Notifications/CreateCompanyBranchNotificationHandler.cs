using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;

namespace DLP.Application.CompanyBranches.NotificationHandlers;

public class CompanyBranchCreatedNotification : IExtendableNotification
{
    public CompanyBranch CompanyBranch { get; }
    public string? SpecificHandlerOnly { get; set; }
    public string Signature => CompanyBranch.Id.ToString();

    public CompanyBranchCreatedNotification(CompanyBranch companyBranch)
    {
        CompanyBranch = companyBranch;
    }
}

public abstract class BaseCompanyBranchCreatedHandler<TContext> : INotificationHandler<CompanyBranchCreatedNotification>
    where TContext : DbContextBase
{
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly DbContextBase _context;
    private readonly string _handlerName;

    public BaseCompanyBranchCreatedHandler(TContext context, IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, string handlerName)
    {
        _context = context;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(CompanyBranchCreatedNotification notification, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrEmpty(notification.SpecificHandlerOnly) &&
            notification.SpecificHandlerOnly != _handlerName)
            return;

        var isMinistryInstance = _context.Database.IsMinistryDatabase();

        if (isMinistryInstance)
        {
            try
            {
                var isDatabaseAvailable = await _healthCheckService.IsDatabaseAvailable<TContext>();
                if (!isDatabaseAvailable)
                {
                    await LogFailedSynchronization(notification, new Exception("Database is unavailable"),
                        cancellationToken);
                    return;
                }

                notification.CompanyBranch.CreatedById = SystemConstants.SystemUserId;
                _context.CompanyBranches.Add(notification.CompanyBranch);

                await _context.SaveChangesAsync(cancellationToken);
                await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
            }
            catch (Exception ex)
            {
                await LogFailedSynchronization(notification, ex, cancellationToken);
            }
        }
    }

    private Task LogFailedSynchronization(CompanyBranchCreatedNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.ADD,
            nameof(CompanyBranch), cancellationToken);
    }
}

public class BetaCompanyBranchCreatedHandler : BaseCompanyBranchCreatedHandler<BetaDbContext>
{
    public BetaCompanyBranchCreatedHandler(BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(BetaCompanyBranchCreatedHandler))
    {
    }
}

public class GammaCompanyBranchCreatedHandler : BaseCompanyBranchCreatedHandler<GammaDbContext>
{
    public GammaCompanyBranchCreatedHandler(GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(GammaCompanyBranchCreatedHandler))
    {
    }
}

public class DeltaCompanyBranchCreatedHandler : BaseCompanyBranchCreatedHandler<DeltaDbContext>
{
    public DeltaCompanyBranchCreatedHandler(DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(DeltaCompanyBranchCreatedHandler))
    {
    }
}