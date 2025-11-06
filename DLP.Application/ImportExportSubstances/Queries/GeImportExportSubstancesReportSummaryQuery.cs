using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.ImportExportSubstances.DTOs;
using DLP.Application.ServiceTechnician.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.ImportExportSubstances.Queries
{
    public class GeImportExportSubstancesReportSummaryQuery : IRequest<OrdinalPaginatedList<ImportExportSubstancesReportSummaryDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; }
        public string SortType { get; set; }
        public string Search { get; set; }
        public bool IsFromExport { get; set; } = false;

    }

    public class GeImportExportSubstancesReportSummaryQueryHandler : IRequestHandler<GeImportExportSubstancesReportSummaryQuery, OrdinalPaginatedList<ImportExportSubstancesReportSummaryDto>>
    {
        private readonly IAppDbContext _context;

        public GeImportExportSubstancesReportSummaryQueryHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<OrdinalPaginatedList<ImportExportSubstancesReportSummaryDto>> Handle(GeImportExportSubstancesReportSummaryQuery request, CancellationToken cancellationToken)
        {

            var search = request.Search;
            var summariesQuery = _context.ImportExportSubstancesReport
                .Include(report => report.ImportExportSubstancesAnnualReport.Where(annualReport => !annualReport.IsDeleted))
                .Where(s => !s.IsDeleted)
                .SelectMany(report => report.ImportExportSubstancesAnnualReport.Where(x=>!x.IsDeleted), (report, annualReport) => new
                {
                    report.Year,
                    annualReport.RefrigerantTypeId,
                    annualReport.RefrigerantType.Name,
                    annualReport.RefrigerantType.ASHRAEDesignation,
                    annualReport.RefrigerantType.ChemicalFormula,
                    annualReport.TariffNumber,
                    annualReport.Import,
                    annualReport.OwnConsumption,
                    annualReport.SalesOnTheBiHMarket,
                    annualReport.TotalExportedQuantity,
                    annualReport.StockBalanceOnTheDay,
                })
                 .GroupBy(r => new { r.Year, r.RefrigerantTypeId, r.Name, r.ASHRAEDesignation, r.ChemicalFormula })
                .Select(g => new ImportExportSubstancesReportSummaryDto
                {
                    RefrigerantTypeId = g.Key.RefrigerantTypeId,
                    Year = g.Key.Year,
                    RefrigerantTypeName = g.Key.Name,
                    RefrigerantTypeASHRAEDesignation = g.Key.ASHRAEDesignation,
                    RefrigerantTypeChemicalFormula = g.Key.ChemicalFormula,
                    TotalTariffNumber = g.Sum(r => r.TariffNumber ?? 0),
                    TotalImport = g.Sum(r => r.Import ?? 0),
                    TotalOwnConsumption = g.Sum(r => r.OwnConsumption ?? 0),
                    TotalSalesOnTheBiHMarket = g.Sum(r => r.SalesOnTheBiHMarket ?? 0),
                    TotalExportedQuantity = g.Sum(r => r.TotalExportedQuantity ?? 0),
                    TotalStockBalanceOnTheDay = g.Sum(r => r.StockBalanceOnTheDay ?? 0),
                });

            if (!string.IsNullOrEmpty(request.Search))
            {
                summariesQuery = summariesQuery.Where(s => s.Year.ToString().Contains(request.Search));
                // Add additional filtering criteria as needed
            }

            // Apply sorting
            if (!string.IsNullOrEmpty(request.SortBy))
            {
                // Example sorting by TotalPurchased
                summariesQuery = request.SortType == "asc"
                    ? summariesQuery.OrderBy(s => s.Year)
                    : summariesQuery.OrderByDescending(s => s.Year);
            }

            OrdinalPaginatedList<ImportExportSubstancesReportSummaryDto> responseData;
            if (request.IsFromExport)
            {
                responseData = new OrdinalPaginatedList<ImportExportSubstancesReportSummaryDto>(summariesQuery.ToList(), summariesQuery.ToList().Count, request.PageNumber, request.PageSize);
            }
            else
            {
                responseData = await summariesQuery
                .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
            }

            //var summaries = await summariesQuery
            //    .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);

            return responseData;

        }
    }
}
