using DLP.Application.Common.Constants;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using DLP.Application.ActivityLogs.Dto;
using DLP.Domain.Enums;
using DLP.Application.Qualifications.Notifications;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Models;

namespace DLP.Application.Qualifications.Commands
{
    public class EditQualificationCommand : IRequest<Unit>
    {
        public Guid QualificationId { get; set; }
        public string CertificateNumber { get; set; }
        public Guid QualificationTypeId { get; set; }
        public string DateOfExam { get; set; }
        public string CertificateDuration { get; set; }

        public List<string> ExistingFileNames { get; set; } = new List<string>();
        public List<string> ToBeDeletedFileNames { get; set; } = new List<string>();
        public List<IFormFile> Files { get; set; } = new List<IFormFile>();
    }

    public class EditQualificationCommandHandler : IRequestHandler<EditQualificationCommand, Unit>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IBlobService _blobService;
        private readonly ILogger<EditQualificationCommandHandler> _logger;

        private readonly IActivityLogger _activityLogger;
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUserService;

        public EditQualificationCommandHandler(IAppDbContext dbContext, IMediator mediator,
            IBlobServiceFactory blobServiceFactory, ILogger<EditQualificationCommandHandler> logger,
            ICurrentUserService currentUserService, IActivityLogger activityLogger)
        {
            _dbContext = dbContext;
            _blobService = blobServiceFactory.Create(FolderNames.Qualifications);
            _logger = logger;
            _currentUserService = currentUserService;
            _mediator = mediator;
            _activityLogger = activityLogger;
        }

        public async Task<Unit> Handle(EditQualificationCommand request, CancellationToken cancellationToken)
        {
            var qualification = await _dbContext.Qualifications
                .Include(x => x.QualificationFiles)
                .AsNoTrackingWithIdentityResolution()
                .FirstOrDefaultAsync(x => x.Id == request.QualificationId, cancellationToken);

            var oldCertificateNumber = qualification.CertificateNumber;
            var performCertificateNumberUpdates = !oldCertificateNumber.Equals(request.CertificateNumber);
            var filesResponse = new List<NotificationFileModel>();

            if (qualification == null)
            {
                await _activityLogger.Error($"Qualification with ID {request.QualificationId} not found.",
                    _currentUserService.UserId);
                _logger.LogError($"Qualification with ID {request.QualificationId} not found.");
                throw new NotFoundException(nameof(Qualification), request.QualificationId);
            }


            if (performCertificateNumberUpdates)
                qualification.CertificateNumber = request.CertificateNumber;

            qualification.QualificationTypeId = request.QualificationTypeId;
            qualification.DateOfExam =
                DateTime.ParseExact(request.DateOfExam, "MM/dd/yyyy", CultureInfo.InvariantCulture);
            qualification.CertificateDuration = DateTime.ParseExact(request.CertificateDuration, "MM/dd/yyyy",
                CultureInfo.InvariantCulture);
            qualification.UpdatedById = _currentUserService.UserId;
            qualification.UpdatedAt = DateTime.UtcNow;

            var newFiles = request.Files.Where(x =>
                !request.ExistingFileNames.Any(fileName => x.FileName.Contains(fileName)));
            var newFilesData = new List<QualificationFile>();

            if (newFiles != null && newFiles.Any())
            {
                newFilesData = await StoreToDirectory(newFiles, filesResponse);
                qualification.QualificationFiles.AddRange(newFilesData);
            }

            foreach (var item in qualification.QualificationFiles)
            {
                if (request.ToBeDeletedFileNames.Any(item.FileName.Equals))
                    item.IsDeleted = true;
            }

            try
            {
                if (performCertificateNumberUpdates)
                {
                    _dbContext.EquipmentActivities
                        .Where(x => x.TechnicianCertificateNumber == oldCertificateNumber)
                        .ExecuteUpdate(
                            x => x.SetProperty(z => z.TechnicianCertificateNumber, request.CertificateNumber));

                    _dbContext.Requests
                        .Where(x => x.CertificationNumbers.Contains(oldCertificateNumber)).ToList()
                        .ForEach(r => r.CertificationNumbers = r.CertificationNumbers
                            .Replace(oldCertificateNumber, request.CertificateNumber));
                }

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Qualification edited successfully."
                });

                _dbContext.Qualifications.Update(qualification);
                await _dbContext.SaveChangesAsync(cancellationToken);

                await _mediator.Publish(new EditQualificationNotification(qualification.DeepClone(),
                    newFilesData.DeepClone(),
                    filesResponse,
                    performCertificateNumberUpdates ? oldCertificateNumber : null), cancellationToken);
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Failed to edit qualification", _currentUserService.UserId);
                _logger.LogError(ex, "An error occurred while handling the EditQualificationCommandHandler");
                throw;
            }

            return Unit.Value;
        }

        private async Task<List<QualificationFile>> StoreToDirectory(IEnumerable<IFormFile> attachments,
            ICollection<NotificationFileModel> filesResponse)
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
                };
                uploadedFiles.Add(requestFile);
            }

            return uploadedFiles;
        }
    }
}