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
    public class GetTotalEquipmentByCoolingSystemQuery : IRequest<OrdinalPaginatedList<ReportResponseDto<Guid>>>
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool IsFromExport { get; set; } = false;

    }

    public class GetTotalEquipmentByCoolingSystemQueryHandler : IRequestHandler<GetTotalEquipmentByCoolingSystemQuery, OrdinalPaginatedList<ReportResponseDto<Guid>>>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUser;

        public GetTotalEquipmentByCoolingSystemQueryHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUser)
        {
            _context = context;
            _logger = logger;
            _currentUser = currentUser;
        }

        public async Task<OrdinalPaginatedList<ReportResponseDto<Guid>>> Handle(GetTotalEquipmentByCoolingSystemQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query1 = from e in _context.Equipments
                             where e.TypeOfCoolingSystemOther == null &&
                                   e.TypeOfCoolingSystem.Name != null && // added filter
                                   ((!request.From.HasValue || e.CreatedAt >= request.From) &&
                                    (!request.To.HasValue || e.CreatedAt <= request.To))
                             group e by new { e.TypeOfCoolingSystem.Name, e.CompanyBranch.Municipality.StateEntity.Id } into g
                             select new ReportResponseDto<Guid>
                             {
                                 Id = Guid.Empty,
                                 Name = g.Key.Name,
                                 StateEntityId = g.Key.Id,
                                 StateEntityName = _context.StateEntities
                                     .Where(x => x.Id == g.Key.Id)
                                     .Select(x => x.Name)
                                     .FirstOrDefault(),
                                 Total = g.Count()
                             };

                var query2 = from e in _context.Equipments
                             where e.TypeOfCoolingSystemOther != null &&
                             e.TypeOfCoolingSystem.Name != null  // added filter
                             && ((!request.From.HasValue || e.CreatedAt >= request.From) && (!request.To.HasValue || e.CreatedAt <= request.To))
                             group e by new { e.TypeOfCoolingSystemOther, e.CompanyBranch.Municipality.StateEntity.Id } into g
                             select new ReportResponseDto<Guid>
                             {
                                 Id = Guid.Empty,
                                 Name = g.Key.TypeOfCoolingSystemOther,
                                 StateEntityId = g.Key.Id,
                                 StateEntityName = _context.StateEntities.Where(x => x.Id == g.Key.Id).FirstOrDefault().Name,
                                 Total = g.Count()
                             };

                var unionQuery = query1.Union(query2);

                OrdinalPaginatedList<ReportResponseDto<Guid>> responseData;
                if (request.IsFromExport)
                {
                    responseData = new OrdinalPaginatedList<ReportResponseDto<Guid>>(unionQuery.ToList(), unionQuery.ToList().Count, request.PageNumber, request.PageSize);
                }
                else
                {
                    responseData = await unionQuery.OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
                }


                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Successfully retrieved Total Equipment by Cooling System"
                });

                return responseData;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to retrieve Total Equipment by Cooling System", _currentUser.UserId);
                throw;
            }
        }
    }

}

