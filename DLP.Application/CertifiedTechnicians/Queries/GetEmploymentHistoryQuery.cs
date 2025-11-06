using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.CertifiedTechnicians.DTOs;
using DLP.Application.Common.DTOs;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.CertifiedTechnicians.Queries
{
    public class GetEmploymentHistoryQuery : IRequest<List<EmploymentHistoryDto>>
    {
        public string? CertifiedTechnicianId { get; set; }
    }

    public class GetEmploymentHistoryQueryHandler : IRequestHandler<GetEmploymentHistoryQuery, List<EmploymentHistoryDto>>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUserService;

        public GetEmploymentHistoryQueryHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task<List<EmploymentHistoryDto>> Handle(GetEmploymentHistoryQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var id = string.IsNullOrEmpty(request.CertifiedTechnicianId) ? _currentUserService.UserId : request.CertifiedTechnicianId;
                var history = await _context.EmploymentHistory
                    .Include(x => x.Company)
                    .Where(x => x.CertifiedTechnicianId == id)
                    .OrderByDescending(x => !x.EndDate.HasValue).ToListAsync();

                var response = history.Adapt<List<EmploymentHistoryDto>>();

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Successfully retrieved employment history"
                });

                return response;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to retrieve employment history", _currentUserService.UserId);
                throw;
            }
        }
    }

}
