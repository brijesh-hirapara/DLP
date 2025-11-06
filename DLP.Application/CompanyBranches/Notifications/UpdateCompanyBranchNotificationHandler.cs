using DLP.Application.Common.Constants;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;

namespace DLP.Application.CompanyBranches.NotificationHandlers;

public class UpdateCompanyBranchNotification : IExtendableNotification
{
    public UpdateCompanyBranchNotification(CompanyBranch companyBranch)
    {
        CompanyBranch = companyBranch;
    }

    public CompanyBranch CompanyBranch { get; set; }
    public string? SpecificHandlerOnly { get; set; }
    public string Signature => CompanyBranch.Id.ToString();
}

public abstract class BaseUpdateCompanyBranchHandler<TContext> : INotificationHandler<UpdateCompanyBranchNotification>
    where TContext : DbContextBase
{
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly DbContextBase _context;
    private readonly string _handlerName;

    public BaseUpdateCompanyBranchHandler(TContext context, IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _context = context;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(UpdateCompanyBranchNotification notification, CancellationToken cancellationToken)
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

                var request = notification.CompanyBranch;
                var companyBranch =
                    await _context.CompanyBranches.FindAsync(new object[] { notification.CompanyBranch.Id },
                        cancellationToken);

                if (companyBranch == null)
                {
                    throw new NotFoundException("CompanyBranch not found.");
                }

                companyBranch.BranchOfficeName = request.BranchOfficeName;
                companyBranch.IdNumber = request.IdNumber;
                companyBranch.Address = request.Address;
                companyBranch.Email = request.Email;
                companyBranch.ContactPerson = request.ContactPerson;
                companyBranch.ContactPhone = request.ContactPhone;
                companyBranch.Place = request.Place;
                companyBranch.MunicipalityId = request.MunicipalityId;
                companyBranch.UpdatedAt = DateTime.UtcNow;
                companyBranch.CreatedById = SystemConstants.SystemUserId;
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

    private Task LogFailedSynchronization(UpdateCompanyBranchNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.UPDATE,
            nameof(CompanyBranch), cancellationToken);
    }
}

public class BetaUpdateCompanyBranchHandler : BaseUpdateCompanyBranchHandler<BetaDbContext>
{
    public BetaUpdateCompanyBranchHandler(BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(BetaUpdateCompanyBranchHandler))
    {
    }
}

public class GammaUpdateCompanyBranchHandler : BaseUpdateCompanyBranchHandler<GammaDbContext>
{
    public GammaUpdateCompanyBranchHandler(GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(GammaUpdateCompanyBranchHandler))
    {
    }
}

public class DeltaUpdateCompanyBranchHandler : BaseUpdateCompanyBranchHandler<DeltaDbContext>
{
    public DeltaUpdateCompanyBranchHandler(DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(DeltaUpdateCompanyBranchHandler))
    {
    }
}