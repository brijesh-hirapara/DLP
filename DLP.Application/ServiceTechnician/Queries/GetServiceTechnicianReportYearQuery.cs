using DLP.Application.Common.Interfaces;
using DLP.Application.ServiceTechnician.DTOs;
using MediatR;

namespace DLP.Application.ServiceTechnician.Queries
{
    public class GetServiceTechnicianReportYearQuery : IRequest<ServiceTechnicianReportYearDto>
    {
    }

    public class GetServiceTechnicianReportYearQueryHandler : IRequestHandler<GetServiceTechnicianReportYearQuery, ServiceTechnicianReportYearDto>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public GetServiceTechnicianReportYearQueryHandler(IAppDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<ServiceTechnicianReportYearDto> Handle(GetServiceTechnicianReportYearQuery request, CancellationToken cancellationToken)
        {
            var organizationId = _currentUserService.OrganizationId;
            ServiceTechnicianReportYearDto serviceTechnicianReportYearDto = new ServiceTechnicianReportYearDto();
            // Determine the current year
            int currentYear = DateTime.Now.Year;
            List<int> existingYears = _context.ServiceTechnicianReport.Where(x => x.OrganizationId == organizationId && !x.IsDeleted).Select(r => r.Year).ToList();

            // Calculate missing years
            List<int> missingYears = new List<int>();
            for (int year = currentYear - 3; year < currentYear; year++)
            {
                if (!existingYears.Contains(year))
                {
                    missingYears.Add(year);
                }
            }

            if (missingYears.Count == 0)
            {
                // If no missing years found, return an appropriate response
                return serviceTechnicianReportYearDto;
            }

            serviceTechnicianReportYearDto.Year = missingYears;

            return serviceTechnicianReportYearDto;
        }
    }
}

