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
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Mappings;

namespace DLP.Application.Reports.Queries
{
    public class GetTotalEquipmentByMunicipalityQuery : IRequest<OrdinalPaginatedList<ReportResponseDto<Guid>>>
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool IsFromExport { get; set; } = false;

    }

    public class GetTotalEquipmentByMunicipalityQueryHandler : IRequestHandler<GetTotalEquipmentByMunicipalityQuery, OrdinalPaginatedList<ReportResponseDto<Guid>>>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUser;

        public GetTotalEquipmentByMunicipalityQueryHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUser)
        {
            _context = context;
            _logger = logger;
            _currentUser = currentUser;
        }

        public async Task<OrdinalPaginatedList<ReportResponseDto<Guid>>> Handle(GetTotalEquipmentByMunicipalityQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query = from e in _context.Equipments.Where(x => !x.IsArchived && !x.IsDeleted)
                            join b in _context.CompanyBranches on e.CompanyBranchId equals b.Id
                            join m in _context.Municipalities on b.MunicipalityId equals m.Id into grouping
                            from m in grouping.DefaultIfEmpty()
                            where e.IsDeleted == false && e.IsArchived == false && ((!request.From.HasValue || e.CreatedAt >= request.From) && (!request.To.HasValue || e.CreatedAt <= request.To))
                            group e by new { m.Id, m.Name, m.StateEntityId } into g
                            select new ReportResponseDto<Guid>
                            {
                                Id = g.Key.Id,
                                Name = g.Key.Name,
                                StateEntityId = g.Key.StateEntityId,
                                StateEntityName = _context.StateEntities.Where(x=>x.Id == g.Key.StateEntityId).FirstOrDefault().Name,
                                Total = g.Count()
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

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Successfully retrieved Total Equipment by Municipality"
                });

                return responseData;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to retrieve Total Equipment by Municipality", _currentUser.UserId);
                throw;
            }
        }
    }

}

