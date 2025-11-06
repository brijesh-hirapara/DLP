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
    public class GetRefrigerantQuantityByTypeAndStateEntityQuery : IRequest<OrdinalPaginatedList<RefrigerantTypeDto>>
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool IsFromExport { get; set; } = false;

    }

    public class GetRefrigerantQuantityByTypeAndStateEntityQueryHandler : IRequestHandler<GetRefrigerantQuantityByTypeAndStateEntityQuery, OrdinalPaginatedList<RefrigerantTypeDto>>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUser;

        public GetRefrigerantQuantityByTypeAndStateEntityQueryHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUser)
        {
            _context = context;
            _logger = logger;
            _currentUser = currentUser;
        }

        public async Task<OrdinalPaginatedList<RefrigerantTypeDto>> Handle(GetRefrigerantQuantityByTypeAndStateEntityQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query = from e in _context.Equipments
                            join r in _context.RefrigerantTypes on e.RefrigerantTypeId equals r.Id
                            join c in _context.CompanyBranches on e.CompanyBranchId equals c.Id
                            join m in _context.Municipalities on c.MunicipalityId equals m.Id
                            where ((!request.From.HasValue || e.CreatedAt >= request.From) && (!request.To.HasValue || e.CreatedAt <= request.To))
                            group e by new { r.Id, r.Name, m.StateEntityId } into g
                            select new RefrigerantTypeDto
                            {
                                Id = g.Key.Id,
                                Name = g.Key.Name,
                                Quantity = g.Sum(e => e.MassOfRefrigerantKg ?? 0),
                                StateEntityId = g.Key.StateEntityId,
                                StateEntityName = _context.StateEntities.Where(x => x.Id == g.Key.StateEntityId).FirstOrDefault().Name,

                            };

                OrdinalPaginatedList<RefrigerantTypeDto> responseData;

                if (request.IsFromExport)
                {
                    responseData = new OrdinalPaginatedList<RefrigerantTypeDto>(query.ToList(), query.ToList().Count, request.PageNumber, request.PageSize);
                }
                else
                {
                    responseData = await query.OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
                }

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Successfully retrieved Refrigerant Quantity by Type and State Entity"
                });

                return responseData;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to retrieve Refrigerant Quantity by Type and State Entity", _currentUser.UserId);
                throw;
            }
        }
    }

}