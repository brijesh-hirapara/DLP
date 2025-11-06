using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.CertifiedTechnicians.DTO;
using DLP.Application.CertifiedTechnicians.DTOs;
using DLP.Application.Common.Constants;
using DLP.Application.Common.DTOs;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.CertifiedTechnicians.Queries
{
    public class GetQualificationsQuery : IRequest<List<QualificationDto>>
    {
        public string CertifiedTechnicianId { get; set; }
    }

    public class GetQualificationsQueryHandler : IRequestHandler<GetQualificationsQuery, List<QualificationDto>>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly IBlobService _blobService;
        private readonly ICurrentUserService _currentUserService;

        public GetQualificationsQueryHandler(IAppDbContext context, IBlobServiceFactory blobServiceFactory, IActivityLogger logger, ICurrentUserService currentUserService)
        {
            _logger = logger;
            _context = context;
            _blobService = blobServiceFactory.Create(FolderNames.Qualifications);
            _currentUserService = currentUserService;
        }

        public async Task<List<QualificationDto>> Handle(GetQualificationsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var response = await GetQualificationsAsync(request, cancellationToken);

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Successfully retrieved qualifications"
                });

                return response;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to retrieve qualifications", _currentUserService.UserId);
                throw;
            }
        }

        public async Task<List<QualificationDto>> GetQualificationsAsync(GetQualificationsQuery request, CancellationToken cancellationToken)
        {
            var qualificationsFromDb = await GetQualificationsFromDb(request.CertifiedTechnicianId, cancellationToken);

            await ProcessPendingSyncFiles(qualificationsFromDb, cancellationToken);

            var qualificationsDto = await TransformToQualificationDtos(qualificationsFromDb, cancellationToken);

            return qualificationsDto;
        }

        private async Task<List<Qualification>> GetQualificationsFromDb(string certifiedTechnicianId, CancellationToken cancellationToken)
        {
            return await _context.Qualifications
                .Where(x => !x.IsDeleted && x.CertifiedTechnicianId == certifiedTechnicianId)
                .Include(x => x.QualificationFiles)
                .Include(x => x.QualificationType)
                .Include(x => x.TrainingCenter)
                .Include(x => x.CertifiedTechnician)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        private async Task ProcessPendingSyncFiles(List<Qualification> qualificationsFromDb, CancellationToken cancellationToken)
        {
            var pendingSyncFiles = qualificationsFromDb
                .Where(x => x.HasPendingSyncFiles)
                .SelectMany(x => x.QualificationFiles)
                .Where(f => string.IsNullOrEmpty(f.FilePath))
                .ToList();

            if (pendingSyncFiles != null && pendingSyncFiles.Any())
            {
                var pendingSyncIds = pendingSyncFiles.Select(x => x.Id).ToList();
                var files = await _context.FileSynchronizations
                    .Where(x => pendingSyncIds.Contains(x.Id))
                    .ToListAsync(cancellationToken);

                foreach (var file in files)
                {
                    try
                    {
                        var filePath = await _blobService.SaveFileAsync(new MemoryStream(file.Data), file.FileName);
                        await UpdateQualificationFilePath(file.Id, filePath, cancellationToken);
                        _context.FileSynchronizations.Remove(file);
                        await _context.SaveChangesAsync(cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        // Log the exception
                    }
                }


            }
        }

        private async Task UpdateQualificationFilePath(Guid fileId, string filePath, CancellationToken cancellationToken)
        {
            var qualificationFile = await _context.QualificationFiles.FirstOrDefaultAsync(x => x.Id == fileId, cancellationToken);
            if (qualificationFile != null)
            {
                qualificationFile.FilePath = filePath;
                _context.QualificationFiles.Update(qualificationFile);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        private async Task<List<QualificationDto>> TransformToQualificationDtos(List<Qualification> qualifications, CancellationToken cancellationToken)
        {
            var qualificationDtos = new List<QualificationDto>();

            foreach (var qualification in qualifications)
            {
                var files = qualification.QualificationFiles
                    .Where(f => !f.IsDeleted && System.IO.File.Exists(f.FilePath))
                    .Select(f => new FileResultDto
                    {
                        Id = f.Id,
                        ContentType = f.ContentType,
                        FileContents = System.IO.File.ReadAllBytes(f.FilePath),
                        FileName = f.FileName
                    })
                    .ToList();

                var qualificationDto = AdaptToQualificationDto(qualification);
                qualificationDto.QualificationFiles = files;
                qualificationDtos.Add(qualificationDto);
            }

            return qualificationDtos;
        }

        private QualificationDto AdaptToQualificationDto(Qualification qualification)
        {
            var dto = qualification.Adapt<QualificationDto>();
            dto.Locked = _context.Requests.Any(x => x.CertificationNumbers.Contains(dto.CertificateNumber)) || _context.EquipmentActivities.Any(z => z.TechnicianCertificateNumber == dto.CertificateNumber);
            dto.Valid = dto.CertificateDuration.Date > DateTime.Now.Date;
            return dto;
        }

    }
}
