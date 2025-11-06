using System.Globalization;
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

namespace DLP.Application.Equipments.Commands
{
    public class CreateEquipmentActivityCommand : IRequest<Unit>
    {
        public string DateOfChange { get; set; }
        public Guid TypeOfChangeId { get; set; }
        public string? NewOperatorName { get; set; }
        public Guid? NewCoolantId { get; set; }
        public string TechnicianCertificateNumber { get; set; }
        public string? Comments { get; set; }
        public Guid EquipmentId { get; set; }
        public List<IFormFile> Files { get; set; } = new List<IFormFile>();
    }

    public class
        CreateEquipmentActivityCommandHandler : IRequestHandler<CreateEquipmentActivityCommand, Unit>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly IBlobService _blobService;
        private readonly IMediator _mediator;

        public CreateEquipmentActivityCommandHandler(IAppDbContext context, IMediator mediator,
            IBlobServiceFactory blobServiceFactory, ICurrentUserService currentUserService, IActivityLogger logger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _blobService = blobServiceFactory.Create(FolderNames.EquipmentActivities);
            _mediator = mediator;
            _logger = logger;
        }

        public async Task<Unit> Handle(CreateEquipmentActivityCommand request,
            CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            var filesResponse = new List<NotificationFileModel>();
            try
            {
                var isArchived = _context.Equipments.Any(x => x.Id == request.EquipmentId && x.IsArchived);

                if (isArchived)
                {
                    errorMessage = "No action is allowed when Equipment is archived!";
                    throw new Exception(errorMessage);
                }
                var equipmentActivity = new EquipmentActivity
                {
                    Id = Guid.NewGuid(),
                    DateOfChange =
                        DateTime.ParseExact(request.DateOfChange, "MM/dd/yyyy", CultureInfo.InvariantCulture),
                    TypeOfChangeId = request.TypeOfChangeId,
                    NewOperatorName = request?.NewOperatorName,
                    NewCoolantId = request.NewCoolantId,
                    TechnicianCertificateNumber = request.TechnicianCertificateNumber,
                    Comments = request.Comments,
                    CreatedAt = DateTime.UtcNow,
                    CreatedById = _currentUserService.UserId,
                    EquipmentId = request.EquipmentId,
                    ActionTakenBy = _currentUserService.UserId,
                    EquipmentActivityFiles = request.Files != null
                        ? await StoreToDirectory(request.Files, filesResponse, _currentUserService.UserId)
                        : new List<EquipmentActivityFile>()
                };

                equipmentActivity.BeforeLocalSync();
                _context.EquipmentActivities.Add(equipmentActivity);
                await _context.SaveChangesAsync(cancellationToken);

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Equipment activity created successfully for Equipment (ID: {request.EquipmentId})."
                });

                await _mediator.Publish(
                    new CreateEquipmentActivityNotification(equipmentActivity.DeepClone(), filesResponse),
                    cancellationToken);
                return Unit.Value;
            }
            catch (Exception ex)
            {
                foreach (var path in filesResponse.Select(x => x.FilePath))
                {
                    await _blobService.DeleteFileAsync(path);
                }

                await _logger.Exception(ex.Message, "Failed to create equipment activity", _currentUserService.UserId);
                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }
        }

        private async Task<ICollection<EquipmentActivityFile>> StoreToDirectory(IEnumerable<IFormFile> attachments,
            ICollection<NotificationFileModel> filesResponse, string userId)
        {
            if (attachments == null || !attachments.Any())
                return new List<EquipmentActivityFile>();

            var uploadedFiles = new List<EquipmentActivityFile>();

            foreach (var attachment in attachments)
            {
                var fileName = attachment.FileName;
                await using var stream = attachment.OpenReadStream();
                var filePath = await _blobService.SaveFileAsync(stream, fileName);

                filesResponse.Add(new NotificationFileModel(filePath, fileName, attachment.ContentType));
                var requestFile = new EquipmentActivityFile
                {
                    FileName = fileName,
                    FilePath = filePath,
                    Size = attachment.Length,
                    ContentType = attachment.ContentType,
                    CreatedAt = DateTime.UtcNow,
                    LastSyncAt = DateTime.UtcNow,
                    SyncToken = Guid.NewGuid(),
                    ActionTakenBy = userId,
                };
                uploadedFiles.Add(requestFile);
            }

            return uploadedFiles;
        }
    }
}