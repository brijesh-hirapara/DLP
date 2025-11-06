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

namespace DLP.Application.CertifiedTechnicians.Queries;

public class GetTechnicianFromSerialNumberQuery : IRequest<CertifiedTechnicianForUpdateDto>
{
    public string SerialNumber { get; set; }
}

public class GetTechnicianFromSerialNumberQueryHandler : IRequestHandler<GetTechnicianFromSerialNumberQuery, CertifiedTechnicianForUpdateDto>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _logger;
    private readonly ICurrentUserService _currentUserService; // Inject the ICurrentUserService

    public GetTechnicianFromSerialNumberQueryHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUserService)
    {
        _context = context;
        _logger = logger;
        _currentUserService = currentUserService; // Inject the ICurrentUserService
    }

    public async Task<CertifiedTechnicianForUpdateDto> Handle(GetTechnicianFromSerialNumberQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var technician = await _context.Users
                .Include(z => z.Municipality)
                .Include(z => z.Municipality.StateEntity)
                .Include(z => z.Municipality.Canton)
                .Include(x => x.Organization)
                .Include(x => x.Qualifications)
                .Include(z => z.EmploymentHistory.Where(z => z.EndDate.HasValue))
                .FirstOrDefaultAsync(x => x.IsCertifiedTechnician && x.Qualifications.Any(z => z.CertificateNumber.Equals(request.SerialNumber)));

            if (technician == null)
            {
                // Log that no technician with the specified serial number was found
                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "No technician found with the specified serial number"
                });
                return null;
            }

            if (technician.OrganizationId.HasValue && technician.Organization != null && technician.Organization.Type != Domain.Enums.OrganizationTypeEnum.INSTITUTION)
            {
                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Organization is not of the expected type"
                });
                return null;
            }

            await _logger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved a technician"
            });

            return technician.Adapt<CertifiedTechnicianForUpdateDto>();
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to retrieve technician by serial number", _currentUserService.UserId);
            throw;
        }
    }
}
