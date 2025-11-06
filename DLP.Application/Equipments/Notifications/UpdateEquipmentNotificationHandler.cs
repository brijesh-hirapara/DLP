using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Models;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Equipments.Notifications;

public class UpdateEquipmentNotification : IExtendableNotification
{
    public Equipment Equipment { get; }
    public IEnumerable<EquipmentFile> NewFiles { get; }
    public IEnumerable<NotificationFileModel> NewFilesBlob { get; }
    public string? SpecificHandlerOnly { get; set; }
    public string Signature => Equipment.Id.ToString();

    public UpdateEquipmentNotification(Equipment equipment, IEnumerable<EquipmentFile> newFiles,
        IEnumerable<NotificationFileModel> newFilesBlob)
    {
        Equipment = equipment;
        NewFiles = newFiles;
        NewFilesBlob = newFilesBlob;
    }
}

public abstract class UpdateEquipmentNotificationHandler<TContext> : INotificationHandler<UpdateEquipmentNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    protected UpdateEquipmentNotificationHandler(TContext context,
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _context = context;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(UpdateEquipmentNotification notification, CancellationToken cancellationToken)
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
            var request = notification.Equipment;

            var equipment = await _context.Equipments.AsNoTrackingWithIdentityResolution()
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);


            if (equipment == null)
                throw new Exception("Equipment couldn't be found in the Ministry Instance");

            equipment.CompanyBranchId = request.CompanyBranchId;
            equipment.TypeOfEquipmentId = request.TypeOfEquipmentId;
            equipment.TypeOfEquipmentOther = request.TypeOfEquipmentOther;
            equipment.TypeOfCoolingSystemId = request.TypeOfCoolingSystemId;
            equipment.TypeOfCoolingSystemOther = request.TypeOfCoolingSystemOther;
            equipment.Manufacturer = request.Manufacturer;
            equipment.Type = request.Type;
            equipment.Model = request.Model;
            equipment.SerialNumber = request.SerialNumber;
            equipment.YearOfProduction = request.YearOfProduction;
            equipment.DateOfPurchase = request.DateOfPurchase;
            equipment.RefrigerantTypeId = request.RefrigerantTypeId;
            equipment.MassOfRefrigerantKg = request.MassOfRefrigerantKg;
            equipment.PurposeOfEquipmentId = request.PurposeOfEquipmentId;
            equipment.CoolingTemperature = request.CoolingTemperature;
            equipment.CoolingEffectKw = request.CoolingEffectKw;
            equipment.CompressorConnectionPowerKw = request.CompressorConnectionPowerKw;
            equipment.LiquidCollectorVolume = request.LiquidCollectorVolume;
            equipment.MassAddedLastYearInKg = request.MassAddedLastYearInKg;
            equipment.CommissioningDate = request.CommissioningDate;
            equipment.Comments = request.Comments;
            equipment.UpdatedAt = DateTime.UtcNow;
            equipment.CreatedById = SystemConstants.SystemUserId;
            equipment.UpdatedById = SystemConstants.SystemUserId;
            equipment.HasPendingSyncFiles = notification.NewFilesBlob.Any();

            _context.Equipments.Update(equipment);

            var deletedFileIds = request.EquipmentFiles.Where(x => x.IsDeleted).Select(z => z.Id);
            if (deletedFileIds.Any())
            {
                var toBeDeletedFilesData = _context.EquipmentFiles.Where(x => deletedFileIds.Contains(x.Id)).ToList();
                _context.EquipmentFiles.RemoveRange(toBeDeletedFilesData);

                var toBeDeletedFiles = _context.FileSynchronizations.Where(x => deletedFileIds.Contains(x.Id)).ToList();
                _context.FileSynchronizations.RemoveRange(toBeDeletedFiles);
            }

            if (equipment.HasPendingSyncFiles)
            {
                var filePairs = notification.NewFiles.Zip(notification.NewFilesBlob, 
                    (data, blob) => new { data, blob });

                foreach (var filePair in filePairs)
                {
                    var item = filePair.data;
                    var filePath = filePair.blob.FilePath;
                    if (!File.Exists(filePath))
                    {
                        continue;
                    }
                    
                    var fileData = await File.ReadAllBytesAsync(filePath, cancellationToken);
                    await _context.EquipmentFiles.AddAsync(new EquipmentFile
                    {
                        Id = item.Id,
                        IsDeleted = item.IsDeleted,
                        ContentType = item.ContentType,
                        FileName = item.FileName,
                        FilePath = string.Empty,
                        CreatedAt = item.CreatedAt,
                        EquipmentId = item.EquipmentId,
                        ActionTakenBy = item.ActionTakenBy,
                        SyncToken = item.SyncToken,
                        LastSyncAt = item.LastSyncAt,
                        Size = item.Size,
                    }, cancellationToken);

                    await _context.FileSynchronizations.AddAsync(new FileSynchronization
                    {
                        FileName = item.FileName,
                        Data = fileData,
                        RelatedEntityId = item.EquipmentId,
                        Id = item.Id,
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

    private Task LogFailedSynchronization(UpdateEquipmentNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.UPDATE,
            nameof(Equipment), cancellationToken);
    }
}

public class BetaUpdateEquipmentHandler : UpdateEquipmentNotificationHandler<BetaDbContext>
{
    public BetaUpdateEquipmentHandler(BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(BetaUpdateEquipmentHandler))
    {
    }
}

public class GammaUpdateEquipmentHandler : UpdateEquipmentNotificationHandler<GammaDbContext>
{
    public GammaUpdateEquipmentHandler(GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(GammaUpdateEquipmentHandler))
    {
    }
}

public class DeltaUpdateEquipmentHandler : UpdateEquipmentNotificationHandler<DeltaDbContext>
{
    public DeltaUpdateEquipmentHandler(DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(DeltaUpdateEquipmentHandler))
    {
    }
}