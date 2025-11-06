using System;
using Microsoft.EntityFrameworkCore;
using DLP.Application.Common.Interfaces;
using DLP.Application.Languages.DTOs;
using DLP.Application.Languages.Queries;
using DLP.Application.Reports.DTOs;
using MediatR;
using System.Data.Entity;
using DLP.Application.ActivityLogs.Dto;
using DLP.Domain.Enums;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;

namespace DLP.Application.Reports.Queries
{
    public class GetTotalCertifiedTechniciansByEntityQuery : IRequest<OrdinalPaginatedList<ReportResponseDto<Guid>>>
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool IsFromExport { get; set; } = false;

    }

    public class GetTotalCertifiedTechniciansByEntityQueryHandler : IRequestHandler<GetTotalCertifiedTechniciansByEntityQuery, OrdinalPaginatedList<ReportResponseDto<Guid>>>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUser;

        public GetTotalCertifiedTechniciansByEntityQueryHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUser)
        {
            _context = context;
            _logger = logger;
            _currentUser = currentUser;
        }

        public async Task<OrdinalPaginatedList<ReportResponseDto<Guid>>> Handle(GetTotalCertifiedTechniciansByEntityQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query = from s in _context.StateEntities
                            join m in _context.Municipalities on s.Id equals m.StateEntityId into sm
                            from m in sm.DefaultIfEmpty()
                            join u in _context.Users on m.Id equals u.MunicipalityId into um
                            from u in um.DefaultIfEmpty()
                            where u == null || u.IsCertifiedTechnician && (!u.IsDeleted && ((!request.From.HasValue || u.CreatedAt >= request.From) && (!request.To.HasValue || u.CreatedAt <= request.To)))
                            group u by new { s.Id, s.Name } into g
                            select new ReportResponseDto<Guid>
                            {
                                Id = g.Key.Id,
                                Name = g.Key.Name,
                                Total = g.Count(u => u != null && u.IsCertifiedTechnician)
                            };


                OrdinalPaginatedList<ReportResponseDto<Guid>> responseData;
                if (request.IsFromExport)
                {
                    responseData = new OrdinalPaginatedList<ReportResponseDto<Guid>>(query.ToList(), query.ToList().Count, request.PageNumber, request.PageSize);
                }
                else
                {
                    responseData = await query.OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
                }

                //var result = await query.OrdinalPaginatedListAsync(request.PageNumber,request.PageSize);

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Successfully retrieved Total Certified Technicians by Entity"
                });

                return responseData;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to retrieve Total Certified Technicians by Entity", _currentUser.UserId);
                throw;
            }
        }
    }

}

