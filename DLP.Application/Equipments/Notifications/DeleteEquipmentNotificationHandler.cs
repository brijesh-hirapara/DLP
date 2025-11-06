using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Equipments.Notifications;

public class DeleteEquipmentNotification : IExtendableNotification
{
    public Guid EquipmentId { get; }
    public string? SpecificHandlerOnly { get; set; }
    public string Signature => EquipmentId.ToString();

    public DeleteEquipmentNotification(Guid equipmentId)
    {
        EquipmentId = equipmentId;
    }
}

public abstract class DeleteEquipmentNotificationHandler<TContext> : INotificationHandler<DeleteEquipmentNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    protected DeleteEquipmentNotificationHandler(TContext context,
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _context = context;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(DeleteEquipmentNotification notification, CancellationToken cancellationToken)
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
                            throw new Exception("This equipment doesn't exist in the target database!");
            equipment.IsDeleted = true;
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

    private Task LogFailedSynchronization(DeleteEquipmentNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.ADD,
            nameof(Equipment), cancellationToken);
    }
}

public class BetaDeleteEquipmentHandler : DeleteEquipmentNotificationHandler<BetaDbContext>
{
    public BetaDeleteEquipmentHandler(BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(BetaDeleteEquipmentHandler))
    {
    }
}

public class GammaDeleteEquipmentHandler : DeleteEquipmentNotificationHandler<GammaDbContext>
{
    public GammaDeleteEquipmentHandler(GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(GammaDeleteEquipmentHandler))
    {
    }
}

public class DeltaDeleteEquipmentHandler : DeleteEquipmentNotificationHandler<DeltaDbContext>
{
    public DeltaDeleteEquipmentHandler(DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(DeltaDeleteEquipmentHandler))
    {
    }
}