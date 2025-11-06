using DLP.Application.ActivityLogs.Dto;
using DLP.Application.CertifiedTechnicians.DTO;
using DLP.Application.Common.Interfaces;
using DLP.Application.Users.DTO;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace DLP.Application.CertifiedTechnicians.Queries;

public class GetCertifiedTechnicianQuery : IRequest<CertifiedTechnicianForUpdateDto>
{
    public string TechnicianId { get; set; }
}

public class GetCertifiedTechnicianQueryHandler : IRequestHandler<GetCertifiedTechnicianQuery, CertifiedTechnicianForUpdateDto>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUserService;

    public GetCertifiedTechnicianQueryHandler(
        IAppDbContext context,
        IActivityLogger activityLogger,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _activityLogger = activityLogger;
        _currentUserService = currentUserService;
    }

    public async Task<CertifiedTechnicianForUpdateDto> Handle(GetCertifiedTechnicianQuery request, CancellationToken cancellationToken)
    {
        string errorMessage = string.Empty;
        try
        {
            errorMessage = "Invalid Technician!";
            var result = await _context.Users
                .IgnoreQueryFilters()
                .Include(x => x.Organization)
                .Include(z => z.Municipality)
                .FirstOrDefaultAsync(x => x.Id == request.TechnicianId && x.IsCertifiedTechnician, cancellationToken)
                ?? throw new Exception(errorMessage);

            var technician = new CertifiedTechnicianForUpdateDto
            {
                Id = result.Id,
                FirstName = result.FirstName,
                LastName = result.LastName,
                PlaceOfBirth = result.PlaceOfBirth,
                Address = result.Address,
                Comments = result.Comments,
                Municipality = result.Municipality?.Name,
                Email = result.Email,
                PersonalNumber = result.PersonalNumber,
                MunicipalityId = result.MunicipalityId.Value,
                Organization = result.Organization?.Name, 
                LanguageId = result.LanguageId
            };

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = $"Retrieved details for certified technician with ID: {request.TechnicianId}",
                Description = JsonConvert.SerializeObject(technician)
                
            });

            return technician;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, $"Failed to retrieve details for certified technician with ID: {request.TechnicianId}", _currentUserService.UserId);
            throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
        }
    }
}
