using System.Globalization;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Models;
using DLP.Application.Qualifications.Notifications;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace DLP.Application.Qualifications.Commands
{
    public class CreateQualificationCommand : IRequest<List<NotificationFileModel>>
    {
        public string CertifiedTechnicianId { get; set; }
        public string CertificateNumber { get; set; }
        public Guid QualificationTypeId { get; set; }
        public Guid TrainingCenterId { get; set; }
        public string DateOfExam { get; set; }
        public string CertificateDuration { get; set; }
        public List<IFormFile> Files { get; set; } = new List<IFormFile>();
        public bool IgnoreSendingNotifications { get; set; } = false;
    }

    public class
        CreateQualificationCommandHandler : IRequestHandler<CreateQualificationCommand, List<NotificationFileModel>>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IBlobService _blobService;
        private readonly ILogger<CreateQualificationCommandHandler> _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMediator _mediator;
        private readonly IActivityLogger _activityLogger;

        public CreateQualificationCommandHandler(IAppDbContext dbContext, IMediator mediator,
            IBlobServiceFactory blobServiceFactory, ILogger<CreateQualificationCommandHandler> logger,
            ICurrentUserService currentUserService, IActivityLogger activityLogger)
        {
            _dbContext = dbContext;
            _blobService = blobServiceFactory.Create(FolderNames.Qualifications);
            _logger = logger;
            _mediator = mediator;
            _currentUserService = currentUserService;
            _activityLogger = activityLogger;
        }

        public async Task<List<NotificationFileModel>> Handle(CreateQualificationCommand request,
            CancellationToken cancellationToken)
        {
            var filesResponse = new List<NotificationFileModel>();
            var qualification = new Qualification()
            {
                Id = Guid.NewGuid(),
                CertifiedTechnicianId = request.CertifiedTechnicianId,
                CertificateNumber = request.CertificateNumber,
                QualificationTypeId = request.QualificationTypeId,
                TrainingCenterId = _currentUserService.OrganizationId.Value,
                CreatedAt = DateTime.UtcNow,
                DateOfExam = DateTime.ParseExact(request.DateOfExam, "MM/dd/yyyy", CultureInfo.InvariantCulture),
                CertificateDuration = DateTime.ParseExact(request.CertificateDuration, "MM/dd/yyyy",
                    CultureInfo.InvariantCulture),
                CreatedById = _currentUserService.UserId,
                ActionTakenBy = _currentUserService.UserId,
                HasPendingSyncFiles = false,
                QualificationFiles = await StoreToDirectory(request.Files, filesResponse, _currentUserService.UserId),
            };

            qualification.BeforeLocalSync();

            try
            {
                _dbContext.Qualifications.Add(qualification);
                await _dbContext.SaveChangesAsync(cancellationToken);

                if (!request.IgnoreSendingNotifications)
                {
                    await _mediator.Publish(
                        new AddQualificationNotification(qualification.DeepClone(), filesResponse), cancellationToken);
                }

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Qualification created successfully."
                });
            }
            catch (Exception ex)
            {
                foreach (var path in filesResponse.Select(x => x.FilePath))
                {
                    await _blobService.DeleteFileAsync(path);
                }

                _logger.LogError(ex, "An error occurred while handling the CreateQualificationCommandHandler");
                await _activityLogger.Exception(ex.Message, "Failed to create qualification",
                    _currentUserService.UserId);
                throw;
            }

            return filesResponse;
        }

        private async Task<List<QualificationFile>> StoreToDirectory(IEnumerable<IFormFile> attachments,
            ICollection<NotificationFileModel> filesResponse, string userId)
        {
            var uploadedFiles = new List<QualificationFile>();

            foreach (var attachment in attachments)
            {
                var fileName = attachment.FileName;
                await using var stream = attachment.OpenReadStream();
                var filePath = await _blobService.SaveFileAsync(stream, fileName);

                filesResponse.Add(new NotificationFileModel(filePath, fileName, attachment.ContentType));
                var requestFile = new QualificationFile
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