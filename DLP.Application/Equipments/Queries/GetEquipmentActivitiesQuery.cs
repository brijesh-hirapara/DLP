using System;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.DTOs;
using DLP.Application.Common.Interfaces;
using DLP.Application.Equipments.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Equipments.Queries
{
    public class GetEquipmentActivitiesQuery : IRequest<List<EquipmentActivityDto>>
    {
        public Guid EquipmentId { get; set; }
    }

    public class GetEquipmentActivitiesQueryHandler : IRequestHandler<GetEquipmentActivitiesQuery, List<EquipmentActivityDto>>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUserService;
        private readonly IBlobService _blobService;

        public GetEquipmentActivitiesQueryHandler(IAppDbContext context, IBlobServiceFactory factory, IActivityLogger activityLogger, ICurrentUserService currentUserService)
        {
            _context = context;
            _activityLogger = activityLogger;
            _blobService = factory.Create(FolderNames.EquipmentActivities);
            _currentUserService = currentUserService;
        }

        public async Task<List<EquipmentActivityDto>> Handle(GetEquipmentActivitiesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var equipmentActivities = await _context.EquipmentActivities
                    .Include(x => x.Equipment)
                        .ThenInclude(x => x.CompanyBranch)
                    .Include(x => x.EquipmentActivityFiles)
                    .Include(x => x.NewCoolant)
                    .Include(x => x.TypeOfChange)
                    .Include(x => x.CreatedBy)
                    .Where(ea => ea.EquipmentId == request.EquipmentId && !ea.IsDeleted)
                    .ToListAsync(cancellationToken);

                foreach (var activity in equipmentActivities)
                {
                    var filesToSync = activity.EquipmentActivityFiles
                        .Where(f => string.IsNullOrEmpty(f.FilePath) || !File.Exists(f.FilePath))
                        .ToList();

                    foreach (var file in filesToSync)
                    {
                        var fileSync = await _context.FileSynchronizations
                            .Where(x => x.Id == file.Id)
                            .SingleOrDefaultAsync(cancellationToken);

                        if (fileSync != null)
                        {
                            var fileStream = new MemoryStream(fileSync.Data);
                            var filePath = await _blobService.SaveFileAsync(fileStream, fileSync.FileName);
                            file.FilePath = filePath; // Update the file path with the new path after saving to blob storage
                            _context.EquipmentActivityFiles.Update(file); // Update the EquipmentActivityFile with the new path
                            _context.FileSynchronizations.Remove(fileSync); // Remove the FileSynchronization entry as it's no longer needed
                        }
                    }
                }

                await _context.SaveChangesAsync(cancellationToken); // Save all changes to the database

                var response = equipmentActivities.Select(ea =>
                {
                    var item = ea.Adapt<EquipmentActivityDto>();
                    item.Files = ea.EquipmentActivityFiles
                        .Where(f => !f.IsDeleted && File.Exists(f.FilePath))
                        .Select(f => new FileResultDto
                        {
                            ContentType = f.ContentType,
                            FileContents = File.ReadAllBytes(f.FilePath),
                            FileName = f.FileName
                        }).ToList();
                    return item;
                }).ToList();

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Retrieved equipment activities successfully."
                });

                return response;
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Failed to retrieve equipment activities", _currentUserService.UserId);
                throw;
            }
        }
    }

}

