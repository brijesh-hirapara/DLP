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
    public class GetTotalCertifiedTechniciansByQualificationQuery : IRequest<OrdinalPaginatedList<ReportResponseDto<Guid>>>
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool IsFromExport { get; set; } = false;

    }

    public class GetTotalCertifiedTechniciansByQualificationQueryHandler : IRequestHandler<GetTotalCertifiedTechniciansByQualificationQuery, OrdinalPaginatedList<ReportResponseDto<Guid>>>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUser;

        public GetTotalCertifiedTechniciansByQualificationQueryHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUser)
        {
            _context = context;
            _logger = logger;
            _currentUser = currentUser;
        }

        public async Task<OrdinalPaginatedList<ReportResponseDto<Guid>>> Handle(GetTotalCertifiedTechniciansByQualificationQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query = from q in _context.Qualifications
                            join c in _context.Codebooks on q.QualificationTypeId equals c.Id into grouping
                            from c in grouping.DefaultIfEmpty()
                            where !q.IsDeleted && ((!request.From.HasValue || q.CreatedAt >= request.From) && (!request.To.HasValue || q.CreatedAt <= request.To))
                            group q by new { c.Id, c.Name } into g
                            select new ReportResponseDto<Guid>
                            {
                                Id = g.Key.Id,
                                Name = g.Key.Name,
                                Total = g.Select(q => q.CertifiedTechnicianId).Distinct().Count()
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

                //var result = await query.OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Successfully retrieved Total Certified Technicians by Qualification"
                });

                return responseData;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to retrieve Total Certified Technicians by Qualification", _currentUser.UserId);
                throw;
            }
        }
    }

}

