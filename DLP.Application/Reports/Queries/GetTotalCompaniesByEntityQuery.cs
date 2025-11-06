using System;
using Microsoft.EntityFrameworkCore;
using DLP.Application.Common.Interfaces;
using DLP.Application.Languages.DTOs;
using DLP.Application.Languages.Queries;
using DLP.Application.Reports.DTOs;
using MediatR;
using System.Data.Entity;
using DLP.Application.Common.Extensions;
using DLP.Application.ActivityLogs.Dto;
using DLP.Domain.Enums;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Mappings;

namespace DLP.Application.Reports.Queries
{
    public class GetTotalCompaniesByEntityQuery : IRequest<OrdinalPaginatedList<CompanyByEntityReportDto>>
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool IsFromExport { get; set; } = false;

    }

    public class GetTotalCompaniesByEntityQueryHandler : IRequestHandler<GetTotalCompaniesByEntityQuery, OrdinalPaginatedList<CompanyByEntityReportDto>>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUser;

        public GetTotalCompaniesByEntityQueryHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUser)
        {
            _context = context;
            _logger = logger;
            _currentUser = currentUser;
        }

        public async Task<OrdinalPaginatedList<CompanyByEntityReportDto>> Handle(GetTotalCompaniesByEntityQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query = from o in _context.Organizations
                            join m in _context.Municipalities on o.MunicipalityId equals m.Id
                            join s in _context.StateEntities on m.StateEntityId equals s.Id
                            where !o.IsDeleted && o.Type != Domain.Enums.OrganizationTypeEnum.INSTITUTION
                            group o by new { s.Id, s.Name, o.Type } into g
                            select new CompanyByEntityReportDto
                            {
                                Id = g.Key.Id,
                                Name = g.Key.Name,
                                Type = g.Key.Type.GetRawDescription(),
                                Total = g.Count()
                            };

                OrdinalPaginatedList<CompanyByEntityReportDto> responseData;

                if (request.IsFromExport)
                {
                    responseData = new OrdinalPaginatedList<CompanyByEntityReportDto>(query.ToList(), query.ToList().Count, request.PageNumber, request.PageSize);
                }
                else
                {
                    responseData = await query.OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
                }

                //var result = await query.OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Successfully retrieved Total Companies by Entity"
                });

                return responseData;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to retrieve Total Companies by Entity", _currentUser.UserId);
                throw;
            }
        }
    }

}

