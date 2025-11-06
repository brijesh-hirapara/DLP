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
using DLP.Application.Requests.DTOs;

namespace DLP.Application.Reports.Queries
{
    public class GetTotalCertifiedTechniciansByTrainingCenterQuery : IRequest<OrdinalPaginatedList<ReportResponseDto<Guid>>>
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool IsFromExport { get; set; } = false;

    }

    public class GetTotalCertifiedTechniciansByTrainingCenterQueryHandler : IRequestHandler<GetTotalCertifiedTechniciansByTrainingCenterQuery, OrdinalPaginatedList<ReportResponseDto<Guid>>>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUser;

        public GetTotalCertifiedTechniciansByTrainingCenterQueryHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUser)
        {
            _context = context;
            _logger = logger;
            _currentUser = currentUser;
        }

        public async Task<OrdinalPaginatedList<ReportResponseDto<Guid>>> Handle(GetTotalCertifiedTechniciansByTrainingCenterQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query = _context.Organizations
                    .GroupJoin(_context.Qualifications.Where(q => !q.IsDeleted && 
                                                                  (!request.From.HasValue || q.CreatedAt >= request.From) && 
                                                                  (!request.To.HasValue || q.CreatedAt <= request.To)),
                        o => o.Id, 
                        q => q.TrainingCenterId, 
                        (organization, qualifications) => new { Organization = organization, Qualifications = qualifications })
                    .SelectMany(
                        temp => temp.Qualifications.DefaultIfEmpty(),
                        (temp, qualification) => new { Organization = temp.Organization, Qualification = qualification })
                    .Where(x => x.Qualification != null)
                    .GroupBy(x => new { x.Organization.Id, x.Organization.Name })
                    .Select(g => new ReportResponseDto<Guid>
                    {
                        Id = g.Key.Id,
                        Name = g.Key.Name,
                        StateEntityId = g.Where(x=> x.Organization.Id == g.Key.Id).FirstOrDefault().Organization.StateEntityId,
                        StateEntityName = _context.StateEntities.Where(t => t.Id == (g.Where(x => x.Organization.Id == g.Key.Id).FirstOrDefault().Organization.StateEntityId)).FirstOrDefault().Name,
                        Total = g.Where(x => x.Qualification != null)
                            .Select(x => x.Qualification.CertifiedTechnicianId)
                            .Distinct()
                            .Count()
                    });


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
                    Activity = "Successfully retrieved Total Certified Technicians by Training Center"
                });

                return responseData;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to retrieve Total Certified Technicians by Training Center", _currentUser.UserId);
                throw;
            }
        }
    }

}

