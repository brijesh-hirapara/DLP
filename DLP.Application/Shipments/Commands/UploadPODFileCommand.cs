using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Models;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Hangfire;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DLP.Application.Shipments.Commands
{
    public class UploadPODFileCommand : IRequest<Unit>
    {
        public Guid ShipmentId { get; set; }
        public List<IFormFile> Files { get; set; } = new List<IFormFile>();
    }

    public class UploadPODFileCommandHandler : IRequestHandler<UploadPODFileCommand, Unit>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IBlobService _blobService;
        private readonly ILogger<UploadPODFileCommandHandler> _logger;
        private readonly IMediator _mediator;
        private readonly IActivityLogger _activityLogger;
        private readonly ITransportRequestService _transportRequestService;
        private readonly IBackgroundJobClient _backgroundJobClient;

        public UploadPODFileCommandHandler(IAppDbContext context, IMediator mediator,
            IBlobServiceFactory blobServiceFactory, ICurrentUserService currentUserService,
            IActivityLogger activityLogger, ILogger<UploadPODFileCommandHandler> logger, ITransportRequestService transportRequestService, IBackgroundJobClient backgroundJobClient)
        {
            _context = context;
            _currentUserService = currentUserService;
            _blobService = blobServiceFactory.Create(FolderNames.PODFile);
            _logger = logger;
            _mediator = mediator;
            _activityLogger = activityLogger;
            _transportRequestService = transportRequestService;
            _backgroundJobClient = backgroundJobClient;
        }

        public async Task<Unit> Handle(UploadPODFileCommand request, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (request.Files == null || !request.Files.Any())
                throw new ArgumentException("No files provided for upload.");

            var uploadedFileModels = new List<NotificationFileModel>();

            try
            {
                var shipment = await _context.Shipments
                    .FirstOrDefaultAsync(r => r.Id == request.ShipmentId && r.IsActive && !r.IsDeleted, cancellationToken);

                if (shipment == null)
                    throw new KeyNotFoundException($"Shipment with ID {request.ShipmentId} not found or inactive.");


                // ✅ Business Rule: Can only upload POD if truck assigned, pickup confirmed, and delivery confirmed
                if (!shipment.IsTruckAssigned || !shipment.IsPickupConfirmed || !shipment.IsDeliveryConfirmed)
                {
                    throw new InvalidOperationException(
                        "POD upload is not allowed. The shipment must have Truck Assigned, Pickup Confirmed, and Delivery Confirmed before uploading POD files.");
                }

                // Upload files and map them
                var uploadedFiles = await StoreFilesAsync(request.Files, uploadedFileModels, _currentUserService.UserId);

                // Attach uploaded files to shipment
                shipment.IsPODUploaded = true;
                shipment.PODUploadedDate = DateTime.UtcNow;
                shipment.ShipmentCarrierStatus = ShipmentsCarrierStatus.PODUploaded;
                shipment.UploadPODFiles ??= new List<UploadPODFile>();
                shipment.UploadPODFiles.AddRange(uploadedFiles);

                _context.Shipments.Update(shipment);
                await _context.SaveChangesAsync(cancellationToken);
                _backgroundJobClient.Schedule(() => _transportRequestService.ChangeShippingPODConfirm(shipment.Id.ToString(), DateTime.UtcNow.AddHours(24).ToString("yyyy-MM-dd HH:mm:ss"), "Transport Request Completed Or Rejected"), TimeSpan.FromHours(24));


                // Log activity
                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"POD files uploaded successfully for Shipment ID: {shipment.Id}"
                });

                _logger.LogInformation("POD files uploaded for Shipment ID {ShipmentId} by user {UserId}", shipment.Id, _currentUserService.UserId);

                return Unit.Value;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading POD files for Shipment ID {ShipmentId}", request.ShipmentId);

                // Cleanup partially uploaded files
                foreach (var file in uploadedFileModels)
                {
                    try
                    {
                        await _blobService.DeleteFileAsync(file.FilePath);
                    }
                    catch (Exception deleteEx)
                    {
                        _logger.LogWarning(deleteEx, "Failed to delete uploaded file after error: {FilePath}", file.FilePath);
                    }
                }

                await _activityLogger.Exception(ex.Message, $"Failed to upload POD files for Shipment ID {request.ShipmentId}", _currentUserService.UserId);
                throw;
            }
        }

        private async Task<List<UploadPODFile>> StoreFilesAsync(IEnumerable<IFormFile> attachments,
             ICollection<NotificationFileModel> filesResponse, string userId)
        {
            var uploadedFiles = new List<UploadPODFile>();

            foreach (var file in attachments)
            {
                if (file.Length == 0)
                    continue;

                var fileName = file.FileName;
                await using var stream = file.OpenReadStream();

                var filePath = await _blobService.SaveFileAsync(stream, fileName);
                filesResponse.Add(new NotificationFileModel(filePath, fileName, file.ContentType));

                uploadedFiles.Add(new UploadPODFile
                {
                    FileName = fileName,
                    FilePath = filePath,
                    Size = file.Length,
                    ContentType = file.ContentType,
                    CreatedAt = DateTime.UtcNow,
                    ActionTakenBy = userId,
                    LastSyncAt = DateTime.UtcNow,
                    SyncToken = Guid.NewGuid(),
                });
            }

            return uploadedFiles;
        }
    }
}