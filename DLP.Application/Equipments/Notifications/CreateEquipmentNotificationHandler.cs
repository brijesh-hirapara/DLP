using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Models;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;

namespace DLP.Application.Equipments.Notifications;

public class AddEquipmentNotification : IExtendableNotification
{
    public Equipment Equipment { get; }
    public IEnumerable<NotificationFileModel> Files { get; }
    public string? SpecificHandlerOnly { get; set; }
    public string Signature => Equipment.Id.ToString();

    public AddEquipmentNotification(Equipment equipment, IEnumerable<NotificationFileModel> files)
    {
        Equipment = equipment;
        Files = files;
    }
}

public abstract class CreateEquipmentNotificationHandler<TContext> : INotificationHandler<AddEquipmentNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    protected CreateEquipmentNotificationHandler(TContext context,
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _context = context;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(AddEquipmentNotification notification, CancellationToken cancellationToken)
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
            var equipment = notification.Equipment;

            equipment.CreatedById = SystemConstants.SystemUserId;
            equipment.HasPendingSyncFiles = notification.Files != null && notification.Files.Any();
            equipment.EquipmentFiles.ToList().ForEach(x => x.FilePath = string.Empty);
            equipment.CleanIncludes();

            _context.Equipments.Add(equipment);

            if (equipment.HasPendingSyncFiles)
            {
                var filePairs = equipment.EquipmentFiles.Zip(notification.Files!,
                    (data, file) => new { data, file });

                foreach (var pair in filePairs)
                {
                    var filePath = pair.file.FilePath;
                    if (!File.Exists(filePath))
                    {
                        continue;
                    }
                    
                    var fileData = await File.ReadAllBytesAsync(filePath, cancellationToken);
                    await _context.FileSynchronizations.AddAsync(new FileSynchronization
                    {
                        FileName = pair.file.FileName,
                        Data = fileData,
                        Id = pair.data.Id,
                        RelatedEntityId = pair.data.EquipmentId,
                        Table = "EquipmentFiles",
                    }, cancellationToken);
                }
            }

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

    private Task LogFailedSynchronization(AddEquipmentNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.ADD,
            nameof(Equipment), cancellationToken);
    }
}

public class BetaAddEquipmentHandler : CreateEquipmentNotificationHandler<BetaDbContext>
{
    public BetaAddEquipmentHandler(BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(BetaAddEquipmentHandler))
    {
    }
}

public class GammaAddEquipmentHandler : CreateEquipmentNotificationHandler<GammaDbContext>
{
    public GammaAddEquipmentHandler(GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(GammaAddEquipmentHandler))
    {
    }
}

public class DeltaAddEquipmentHandler : CreateEquipmentNotificationHandler<DeltaDbContext>
{
    public DeltaAddEquipmentHandler(DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(DeltaAddEquipmentHandler))
    {
    }
}