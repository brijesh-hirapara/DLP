using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Models;
using DLP.Application.Equipments.Notifications;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DLP.Application.Equipments.Commands
{
    public class UpdateEquipmentCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public Guid CompanyBranchId { get; set; }
        public Guid TypeOfEquipmentId { get; set; }
        public string? TypeOfEquipmentOther { get; set; }
        public Guid? TypeOfCoolingSystemId { get; set; }
        public string? TypeOfCoolingSystemOther { get; set; }
        public string? Manufacturer { get; set; }
        public string? Type { get; set; }
        public string? Model { get; set; }
        public string? SerialNumber { get; set; }
        public int? YearOfProduction { get; set; }
        public DateTime? DateOfPurchase { get; set; }
        public double? MassOfRefrigerantKg { get; set; }
        public Guid? PurposeOfEquipmentId { get; set; }
        public double? CoolingTemperature { get; set; }
        public double? CoolingEffectKw { get; set; }
        public double? CompressorConnectionPowerKw { get; set; }
        public double? LiquidCollectorVolume { get; set; }
        public double? MassAddedLastYearInKg { get; set; }
        public DateTime? CommissioningDate { get; set; }
        public string? Comments { get; set; }
        public Guid RefrigerantTypeId { get; set; }
        public List<string> ExistingFileNames { get; set; } = new List<string>();
        public List<string> ToBeDeletedFileNames { get; set; } = new List<string>();
        public List<IFormFile> Files { get; set; } = new List<IFormFile>();
    }

    public class UpdateEquipmentCommandHandler : IRequestHandler<UpdateEquipmentCommand, Unit>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IBlobService _blobService;
        private readonly IActivityLogger _activityLogger;
        private readonly ILogger<UpdateEquipmentCommandHandler> _logger;
        private readonly IMediator _mediator;

        public UpdateEquipmentCommandHandler(IAppDbContext context, IMediator mediator,
            IBlobServiceFactory blobServiceFactory, ICurrentUserService currentUserService,
            IActivityLogger activityLogger, ILogger<UpdateEquipmentCommandHandler> logger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _logger = logger;
            _blobService = blobServiceFactory.Create(FolderNames.Equipments);
            _activityLogger = activityLogger;
            _mediator = mediator;
        }

        public async Task<Unit> Handle(UpdateEquipmentCommand request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            var equipment = await _context.Equipments
                .Include(x => x.EquipmentFiles)
                .Where(e => e.Id == request.Id && !e.IsDeleted)
                .FirstOrDefaultAsync();

            if (equipment is null) { 
                errorMessage = "Invalid Equipment!";
                throw new Exception(errorMessage);
            }
            if (equipment.IsArchived) { 
                errorMessage = "No action is allowed when Equipment is archived!";
                throw new Exception(errorMessage);
            }
            var filesResponse = new List<NotificationFileModel>();

            var toBeDeletedFileIds = request.ToBeDeletedFileNames;
            var newFiles = request.Files.Where(x =>
                !request.ExistingFileNames.Any(fileName => x.FileName.Contains(fileName)));

            if (equipment != null)
            {
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
                equipment.UpdatedById = _currentUserService.UserId;
                equipment.ActionTakenBy = _currentUserService.UserId;

                equipment.BeforeLocalSync();

                equipment.EquipmentFiles.ToList().ForEach(x =>
                {
                    if (request.ToBeDeletedFileNames.Any(fileName => x.FileName.Equals(fileName)))
                    {
                        x.IsDeleted = true;
                        x.ActionTakenBy = _currentUserService.UserId;
                        x.BeforeLocalSync();
                    }
                });

                var files = await StoreToDirectory(newFiles, filesResponse, _currentUserService.UserId);
                equipment.EquipmentFiles.AddRange(files);

                try
                {
                    equipment.BeforeLocalSync();
                    _context.Equipments.Update(equipment);
                    await _context.SaveChangesAsync(cancellationToken);

                    await _activityLogger.Add(new ActivityLogDto
                    {
                        UserId = _currentUserService.UserId,
                        LogTypeId = (int)LogTypeEnum.INFO,
                        Activity = $"Equipment (ID: {request.Id}) updated successfully."
                    });

                    await _mediator.Publish(
                        new UpdateEquipmentNotification(equipment.DeepClone(), files, filesResponse), cancellationToken);
                }
                catch (Exception ex)
                {
                    foreach (var path in filesResponse.Select(x => x.FilePath))
                    {
                        await _blobService.DeleteFileAsync(path);
                    }

                    await _context.EquipmentFiles.Where(x => x.EquipmentId == request.Id && request.ToBeDeletedFileNames
                            .Any(fileName => x.FileName.Equals(fileName)))
                        .ExecuteUpdateAsync(x => x.SetProperty(z => z.IsDeleted, false), cancellationToken);

                    _logger.LogError(ex, "An error occurred while handling the UpdateEquipmentCommandHandler");
                    await _activityLogger.Exception(ex.Message, $"Failed to update equipment (ID: {request.Id})",
                        _currentUserService.UserId);
                    throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
                }
            }

            return Unit.Value;
        }

        private async Task<List<EquipmentFile>> StoreToDirectory(IEnumerable<IFormFile> attachments,
            ICollection<NotificationFileModel> filesResponse, string userId)
        {
            var uploadedFiles = new List<EquipmentFile>();

            foreach (var attachment in attachments)
            {
                var fileName = attachment.FileName;
                await using var stream = attachment.OpenReadStream();
                var filePath = await _blobService.SaveFileAsync(stream, fileName);

                filesResponse.Add(new NotificationFileModel(filePath, fileName, attachment.ContentType));
                var requestFile = new EquipmentFile
                {
                    FileName = fileName,
                    FilePath = filePath,
                    Size = attachment.Length,
                    ContentType = attachment.ContentType,
                    CreatedAt = DateTime.UtcNow,
                    ActionTakenBy = userId,
                    LastSyncAt = DateTime.UtcNow,
                    SyncToken = Guid.NewGuid(),
                };
                uploadedFiles.Add(requestFile);
            }

            return uploadedFiles;
        }
    }
}