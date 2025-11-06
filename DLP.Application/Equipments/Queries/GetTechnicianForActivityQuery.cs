using System;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Equipments.DTOs;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Equipments.Queries
{
    public class GetTechnicianForActivityQuery : IRequest<TechnicianForActivityDto>
    {
        public string TechnicianCertificateNumber { get; set; }
        public Guid EquipmentId { get; set; }
    }

    public class GetTechnicianForActivityQueryHandler : IRequestHandler<GetTechnicianForActivityQuery, TechnicianForActivityDto>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUserService;

        public GetTechnicianForActivityQueryHandler(IAppDbContext context, IActivityLogger activityLogger, ICurrentUserService currentUserService)
        {
            _context = context;
            _activityLogger = activityLogger;
            _currentUserService = currentUserService;
        }

        public async Task<TechnicianForActivityDto?> Handle(GetTechnicianForActivityQuery request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            try
            {
                
                var organizationId = await _context.Equipments
                    .Where(equipment => equipment.Id == request.EquipmentId)
                    .Select(equipment => equipment.CreatedBy.OrganizationId)
                    .FirstOrDefaultAsync(cancellationToken);

                if (organizationId == null)
                {
                    errorMessage = "No organization found for the provided Equipment ID.";
                    throw new Exception(errorMessage);
                }
                errorMessage = "No Qualification was found for the provided certificate number";
                var qualification = await _context.Qualifications.FirstOrDefaultAsync(x=>x.CertificateNumber.Equals(request.TechnicianCertificateNumber)) ?? throw new Exception(errorMessage);
                var technician =  await _context.Users
                    .Include(user => user.Organization)
                    .Include(user => user.Qualifications)
                    .FirstOrDefaultAsync(user => user.Id == qualification.CertifiedTechnicianId)
;

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Retrieved technician (ID: {technician.Id}) for equipment activity successfully."
                });

                return technician?.Adapt<TechnicianForActivityDto>();
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Failed to retrieve technician for equipment activity", _currentUserService.UserId);
                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }
        }
    }

}

