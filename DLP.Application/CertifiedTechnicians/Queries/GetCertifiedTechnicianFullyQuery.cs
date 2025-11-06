using DLP.Application.ActivityLogs.Dto;
using DLP.Application.CertifiedTechnicians.DTO;
using DLP.Application.CertifiedTechnicians.DTOs;
using DLP.Application.Common.DTOs;
using DLP.Application.Common.Interfaces;
using DLP.Application.Users.DTO;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DLP.Application.CertifiedTechnicians.Queries;

public class GetCertifiedTechnicianFullyQuery : IRequest<CertifiedTechnicianDto>
{
    public string TechnicianId { get; set; }
}

public class GetCertifiedTechnicianFullyQueryHandler : IRequestHandler<GetCertifiedTechnicianFullyQuery, CertifiedTechnicianDto>
{
    private readonly IAppDbContext _context;
    private readonly ILogger<GetCertifiedTechnicianFullyQueryHandler> _logger;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUserService;

    public GetCertifiedTechnicianFullyQueryHandler(
        IAppDbContext context,
        ILogger<GetCertifiedTechnicianFullyQueryHandler> logger,
        IActivityLogger activityLogger,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _logger = logger;
        _activityLogger = activityLogger;
        _currentUserService = currentUserService;
    }

    public async Task<CertifiedTechnicianDto> Handle(GetCertifiedTechnicianFullyQuery request, CancellationToken cancellationToken)
    {
        string errorMessage = string.Empty;
        try
        {
            errorMessage = "Technician not found";
            var result = await _context.Users
            .Include(x => x.EmploymentHistory)
            .ThenInclude(x => x.Company)
            .ThenInclude(x => x.Municipality)
            .Include(x => x.Qualifications)
            .FirstOrDefaultAsync(x => x.Id == request.TechnicianId, cancellationToken: cancellationToken)
            ?? throw new Exception(errorMessage);

            var technician = result.Adapt<CertifiedTechnicianDto>();

            var qualifications = await _context.Qualifications          
                    .Include(x => x.QualificationFiles)
                    .Include(x => x.QualificationType)
                    .Include(x => x.TrainingCenter)
                    .Where(x => x.CertifiedTechnicianId == request.TechnicianId)
                    .Select(q => new
                    {
                        Qualification = q,
                        Files = q.QualificationFiles.Where(x=>!x.IsDeleted).Select(f => new FileResultDto
                        {
                            ContentType = f.ContentType,
                            FileContents = File.ReadAllBytes(f.FilePath),
                            FileName = f.FileName
                        }).ToList()
                    })
                    .OrderByDescending(x => x.Qualification.CreatedAt)
                    .ToListAsync(cancellationToken);

            technician.Qualifications = qualifications.Select(q =>
            {
                var item = q.Qualification.Adapt<QualificationDto>();

                item.Valid = item.CertificateDuration.Date > DateTime.Now.Date;
                item.QualificationFiles = q.Files;
                return item;
            }).ToList();

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = $"Retrieved full details for technician with ID: {request.TechnicianId}"
            });

            return technician;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving the certified technician details");
            await _activityLogger.Exception(ex.Message, $"Failed to retrieve full details for technician with ID: {request.TechnicianId}", _currentUserService.UserId);
            throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
        }
    }
}