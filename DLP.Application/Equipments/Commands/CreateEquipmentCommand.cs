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
using Microsoft.Extensions.Logging;

namespace DLP.Application.Equipments.Commands
{
    public class CreateEquipmentCommand : IRequest<Unit>
    {
        public Guid CompanyBranchId { get; set; }
        public Guid TypeOfEquipmentId { get; set; }
        public string? TypeOfEquipmentOther { get; set; }
        public Guid? TypeOfCoolingSystemId { get; set; }
        public string? TypeOfCoolingSystemOther { get; set; }
        public string? Manufacturer { get; set; }
        public string? Type { get; set; }
        public string? Model { get; set; }
        public string SerialNumber { get; set; }
        public int? YearOfProduction { get; set; }
        public string DateOfPurchase { get; set; }
        public Guid RefrigerantTypeId { get; set; }
        public double MassOfRefrigerantKg { get; set; }
        public Guid? PurposeOfEquipmentId { get; set; }
        public double CoolingTemperature { get; set; }
        public double CoolingEffectKw { get; set; }
        public double CompressorConnectionPowerKw { get; set; }
        public double LiquidCollectorVolume { get; set; }
        public double MassAddedLastYearInKg { get; set; }
        public string CommissioningDate { get; set; }
        public string? Comments { get; set; }
        public List<IFormFile> Files { get; set; } = new List<IFormFile>();
    }

    public class CreateEquipmentCommandHandler : IRequestHandler<CreateEquipmentCommand, Unit>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IBlobService _blobService;
        private readonly ILogger<CreateEquipmentCommandHandler> _logger;
        private readonly IMediator _mediator;
        private readonly IActivityLogger _activityLogger;

        public CreateEquipmentCommandHandler(IAppDbContext context, IMediator mediator,
            IBlobServiceFactory blobServiceFactory, ICurrentUserService currentUserService,
            IActivityLogger activityLogger, ILogger<CreateEquipmentCommandHandler> logger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _blobService = blobServiceFactory.Create(FolderNames.Equipments);
            _logger = logger;
            _mediator = mediator;
            _activityLogger = activityLogger;
        }

        public async Task<Unit> Handle(CreateEquipmentCommand request, CancellationToken cancellationToken)
        {
            var filesResponse = new List<NotificationFileModel>();

            try
            {
                var equipment = new Equipment
                {
                    CompanyBranchId = request.CompanyBranchId,
                    TypeOfEquipmentId = request.TypeOfEquipmentId,
                    TypeOfEquipmentOther = request.TypeOfEquipmentOther,
                    TypeOfCoolingSystemId = request.TypeOfCoolingSystemId,
                    TypeOfCoolingSystemOther = request.TypeOfCoolingSystemOther,
                    Manufacturer = request.Manufacturer,
                    Type = request.Type,
                    Model = request.Model,
                    SerialNumber = request.SerialNumber,
                    YearOfProduction = request.YearOfProduction,
                    DateOfPurchase = request.DateOfPurchase.TryConvertStringToDate(),
                    RefrigerantTypeId = request.RefrigerantTypeId,
                    MassOfRefrigerantKg = request.MassOfRefrigerantKg,
                    PurposeOfEquipmentId = request.PurposeOfEquipmentId,
                    CoolingTemperature = request.CoolingTemperature,
                    CoolingEffectKw = request.CoolingEffectKw,
                    CompressorConnectionPowerKw = request.CompressorConnectionPowerKw,
                    LiquidCollectorVolume = request.LiquidCollectorVolume,
                    MassAddedLastYearInKg = request.MassAddedLastYearInKg,
                    CommissioningDate = request.CommissioningDate.TryConvertStringToDate(),
                    Comments = request.Comments,
                    CreatedAt = DateTime.UtcNow,
                    CreatedById = _currentUserService.UserId,
                    ActionTakenBy = _currentUserService.UserId,
                    EquipmentFiles = request.Files != null
                        ? await StoreToDirectory(request.Files, filesResponse, _currentUserService.UserId)
                        : new List<EquipmentFile>()
                };

                equipment.BeforeLocalSync();
                _context.Equipments.Add(equipment);
                await _context.SaveChangesAsync(cancellationToken);

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Equipment (ID: {equipment.Id}) created successfully."
                });

                await _mediator.Publish(
                    new AddEquipmentNotification(equipment.DeepClone(), filesResponse),
                    cancellationToken);
                return Unit.Value;
            }
            catch (Exception ex)
            {
                foreach (var path in filesResponse.Select(x => x.FilePath))
                {
                    await _blobService.DeleteFileAsync(path);
                }

                _logger.LogError(ex, "An error occurred while handling the CreateEquipmentCommandHandler");
                await _activityLogger.Exception(ex.Message, "Failed to create equipment", _currentUserService.UserId);
                throw;
            }
        }

        private async Task<List<EquipmentFile>> StoreToDirectory(IEnumerable<IFormFile> attachments,
            ICollection<NotificationFileModel> filesResponse, string userId)
        {
            var uploadedFiles = new List<EquipmentFile>();

            if (attachments == null || !attachments.Any())
                return uploadedFiles;


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