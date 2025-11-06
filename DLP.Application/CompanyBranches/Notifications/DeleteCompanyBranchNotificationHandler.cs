using DLP.Application.Common.Constants;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;

namespace DLP.Application.CompanyBranches.Notifications;

public class DeleteCompanyBranchNotification : IExtendableNotification
{
    public Guid CompanyBranchId { get; set; }
    public string? SpecificHandlerOnly { get; set; }
    public string Signature => CompanyBranchId.ToString();
}

public abstract class
    BaseDeleteCompanyBranchHandler<TContext> : INotificationHandler<DeleteCompanyBranchNotification>
    where TContext : DbContextBase
{
    private readonly DbContextBase _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    public BaseDeleteCompanyBranchHandler(TContext context, IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, string handlerName)
    {
        _context = context;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(DeleteCompanyBranchNotification notification, CancellationToken cancellationToken)
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

                var companyBranch =
                    await _context.CompanyBranches.FindAsync(new object[] { notification.CompanyBranchId },
                        cancellationToken);

                if (companyBranch == null)
                {
                    throw new NotFoundException("CompanyBranch not found.");
                }

                companyBranch.IsDeleted = true;
                companyBranch.UpdatedAt = DateTime.UtcNow;
                companyBranch.UpdatedById = SystemConstants.SystemUserId;

                _context.CompanyBranches.Update(companyBranch);
                await _context.SaveChangesAsync(cancellationToken);
                await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
            }
            catch (Exception ex)
            {
                await LogFailedSynchronization(notification, ex, cancellationToken);
            }
        }
    }

    private Task LogFailedSynchronization(DeleteCompanyBranchNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.DELETE,
            nameof(CompanyBranch), cancellationToken);
    }
}

public class BetaDeleteCompanyBranchHandler : BaseDeleteCompanyBranchHandler<BetaDbContext>
{
    public BetaDeleteCompanyBranchHandler(BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(BetaDeleteCompanyBranchHandler))
    {
    }
}

public class GammaDeleteCompanyBranchHandler : BaseDeleteCompanyBranchHandler<GammaDbContext>
{
    public GammaDeleteCompanyBranchHandler(GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(GammaDeleteCompanyBranchHandler))
    {
    }
}

public class DeltaDeleteCompanyBranchHandler : BaseDeleteCompanyBranchHandler<DeltaDbContext>
{
    public DeltaDeleteCompanyBranchHandler(DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(DeltaDeleteCompanyBranchHandler))
    {
    }
}