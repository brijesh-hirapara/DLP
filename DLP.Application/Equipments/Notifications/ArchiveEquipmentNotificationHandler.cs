using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Equipments.Notifications;

public class ArchiveEquipmentNotification : IExtendableNotification
{
    public Guid EquipmentId { get; }
    public string? SpecificHandlerOnly { get; set; }
    public string Signature => EquipmentId.ToString();

    public ArchiveEquipmentNotification(Guid equipmentId)
    {
        EquipmentId = equipmentId;
    }
}

public abstract class
    ArchiveEquipmentNotificationHandler<TContext> : INotificationHandler<ArchiveEquipmentNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    protected ArchiveEquipmentNotificationHandler(TContext context, IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _context = context;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(ArchiveEquipmentNotification notification, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrEmpty(notification.SpecificHandlerOnly) &&
            notification.SpecificHandlerOnly != _handlerName)
            return;

        var isMinistryInstance = _context.Database.IsMinistryDatabase();

        if (isMinistryInstance)
        {
            var isDatabaseAvailable = await _healthCheckService.IsDatabaseAvailable<TContext>();
            if (!isDatabaseAvailable)
            {
                await LogFailedSynchronization(notification, new Exception("Database is unavailable"),
                    cancellationToken);
                return;
            }

            await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

            var equipment = await _context.Equipments
                                .FirstOrDefaultAsync(e => e.Id == notification.EquipmentId, cancellationToken) ??
                            throw new Exception("This Equipment doesn't exist in the target database!");
            equipment.IsArchived = true;
            equipment.UpdatedById = SystemConstants.SystemUserId;
            equipment.CreatedById = SystemConstants.SystemUserId;
            equipment.CleanIncludes();

            _context.Equipments.Update(equipment);

            try
            {
                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                await LogFailedSynchronization(notification, ex, cancellationToken);
            }
        }
    }

    private Task LogFailedSynchronization(ArchiveEquipmentNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.UPDATE,
            nameof(Equipment), cancellationToken);
    }
}

public class BetaArchiveEquipmentHandler : ArchiveEquipmentNotificationHandler<BetaDbContext>
{
    public BetaArchiveEquipmentHandler(BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(BetaArchiveEquipmentHandler))
    {
    }
}

public class GammaArchiveEquipmentHandler : ArchiveEquipmentNotificationHandler<GammaDbContext>
{
    public GammaArchiveEquipmentHandler(GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(GammaArchiveEquipmentHandler))
    {
    }
}

public class DeltaArchiveEquipmentHandler : ArchiveEquipmentNotificationHandler<DeltaDbContext>
{
    public DeltaArchiveEquipmentHandler(DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(DeltaArchiveEquipmentHandler))
    {
    }
}