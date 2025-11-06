using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Models;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;

namespace DLP.Application.Equipments.Notifications;

public class CreateEquipmentActivityNotification : IExtendableNotification
{
    public EquipmentActivity EquipmentActivity { get; }
    public IEnumerable<NotificationFileModel> Files { get; }
    public string? SpecificHandlerOnly { get; set; }
    public string Signature => EquipmentActivity.Id.ToString();

    public CreateEquipmentActivityNotification(EquipmentActivity equipmentActivity,
        IEnumerable<NotificationFileModel> files)
    {
        EquipmentActivity = equipmentActivity;
        Files = files;
    }
}

public abstract class
    CreateEquipmentActivityNotificationHandler<TContext> : INotificationHandler<CreateEquipmentActivityNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    protected CreateEquipmentActivityNotificationHandler(TContext context,
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _context = context;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(CreateEquipmentActivityNotification notification, CancellationToken cancellationToken)
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

            var equipmentActivity = notification.EquipmentActivity;
            equipmentActivity.CreatedById = SystemConstants.SystemUserId;
            equipmentActivity.HasPendingSyncFiles = notification.Files != null && notification.Files.Any();
            equipmentActivity.CleanIncludes();
            equipmentActivity.EquipmentActivityFiles.ToList().ForEach(x => x.FilePath = string.Empty);
            _context.EquipmentActivities.Add(equipmentActivity);

            if (equipmentActivity.HasPendingSyncFiles)
            {
                var filePairs = equipmentActivity.EquipmentActivityFiles.Zip(notification.Files!,
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
                        RelatedEntityId = pair.data.EquipmentActivityId,
                        Table = "EquipmentActivityFiles",
                    }, cancellationToken);
                }
            }

            _context.EquipmentActivities.Add(equipmentActivity);

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

    private Task LogFailedSynchronization(CreateEquipmentActivityNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.ADD,
            nameof(EquipmentActivity), cancellationToken);
    }
}

public class BetaCreateEquipmentActivityHandler : CreateEquipmentActivityNotificationHandler<BetaDbContext>
{
    public BetaCreateEquipmentActivityHandler(BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(BetaCreateEquipmentActivityHandler))
    {
    }
}

public class GammaCreateEquipmentActivityHandler : CreateEquipmentActivityNotificationHandler<GammaDbContext>
{
    public GammaCreateEquipmentActivityHandler(GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(GammaCreateEquipmentActivityHandler))
    {
    }
}

public class DeltaCreateEquipmentActivityHandler : CreateEquipmentActivityNotificationHandler<DeltaDbContext>
{
    public DeltaCreateEquipmentActivityHandler(DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(DeltaCreateEquipmentActivityHandler))
    {
    }
}