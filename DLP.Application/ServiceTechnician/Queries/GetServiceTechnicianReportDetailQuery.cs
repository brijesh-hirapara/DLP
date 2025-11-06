using DLP.Application.Common.Interfaces;
using DLP.Application.ServiceTechnician.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.ServiceTechnician.Queries
{
    public class GetServiceTechnicianReportDetailQuery : IRequest<ServiceTechnicianReportDetailDto>
    {
        public Guid Id { get; set; }
    }

    public class GetServiceTechnicianReportDetailQueryHandler : IRequestHandler<GetServiceTechnicianReportDetailQuery, ServiceTechnicianReportDetailDto>
    {
        private readonly IAppDbContext _dbContext;

        public GetServiceTechnicianReportDetailQueryHandler(IAppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<ServiceTechnicianReportDetailDto> Handle(GetServiceTechnicianReportDetailQuery request, CancellationToken cancellationToken)
        {
            var serviceTechnicianReport = await _dbContext.ServiceTechnicianReport
                .Include(m => m.ServiceTechnicianAnnualReport.Where(a => !a.IsDeleted))
                .ThenInclude(m => m.RefrigerantType)
                //.Include(m => m.User)
                //.Include(m => m.Organization)
                .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken)

                ?? throw new Exception("Invalid Municipality");

            var serviceTechnicianReportDetail = serviceTechnicianReport.Adapt<ServiceTechnicianReportDetailDto>();

            var serviceTechnicianAnnualReportList = new List<ServiceTechnicianAnnualReportDto>();

            foreach (var report in serviceTechnicianReportDetail.ServiceTechnicianAnnualReport)
            {

                var codebook = await _dbContext.Codebooks
                    .FirstOrDefaultAsync(m => m.Id == report.StateOfSubstanceId && !m.IsDeleted, cancellationToken);
                report.StateOfSubstanceName = codebook.Name;
            }

            return serviceTechnicianReportDetail;
        }
    }
}