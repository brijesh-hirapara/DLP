using DLP.Application.Common.Interfaces;
using DLP.Application.ImportExportSubstances.DTOs;
using MediatR;

namespace DLP.Application.ImportExportSubstances.Queries
{
    public class GetImportExportSubstancesReportYearQuery : IRequest<ImportExportSubstancesReportYearDto>
    {
    }

    public class GetImportExportSubstancesReportYearQueryHandler : IRequestHandler<GetImportExportSubstancesReportYearQuery, ImportExportSubstancesReportYearDto>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public GetImportExportSubstancesReportYearQueryHandler(IAppDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<ImportExportSubstancesReportYearDto> Handle(GetImportExportSubstancesReportYearQuery request, CancellationToken cancellationToken)
        {
            var organizationId = _currentUserService.OrganizationId;
            ImportExportSubstancesReportYearDto importExportSubstancesReportYearDto = new ImportExportSubstancesReportYearDto();
            // Determine the current year
            int currentYear = DateTime.Now.Year;
            List<int> existingYears = _context.ImportExportSubstancesReport.Where(x => x.OrganizationId == organizationId && !x.IsDeleted).Select(r => r.Year).ToList();

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
                return importExportSubstancesReportYearDto;
            }

            importExportSubstancesReportYearDto.Year = missingYears;

            return importExportSubstancesReportYearDto;
        }
    }
}

