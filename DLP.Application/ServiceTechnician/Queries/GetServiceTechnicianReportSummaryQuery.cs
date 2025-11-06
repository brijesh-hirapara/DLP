using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Registers.DTOs;
using DLP.Application.ServiceTechnician.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.ServiceTechnician.Queries
{
    public class GetServiceTechnicianReportSummaryQuery : IRequest<OrdinalPaginatedList<ServiceTechnicianAnnualReportSummaryDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; }
        public string SortType { get; set; }
        public string Search { get; set; }
        public bool IsFromExport { get; set; } = false;

    }

    public class GetServiceTechnicianReportSummaryQueryHandler : IRequestHandler<GetServiceTechnicianReportSummaryQuery, OrdinalPaginatedList<ServiceTechnicianAnnualReportSummaryDto>>
    {
        private readonly IAppDbContext _context;

        public GetServiceTechnicianReportSummaryQueryHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<OrdinalPaginatedList<ServiceTechnicianAnnualReportSummaryDto>> Handle(GetServiceTechnicianReportSummaryQuery request, CancellationToken cancellationToken)
        {

            var search = request.Search;
            var summariesQuery = _context.ServiceTechnicianReport
                .Include(report => report.ServiceTechnicianAnnualReport.Where(annualReport => !annualReport.IsDeleted))
                .Where(s => !s.IsDeleted)
                .SelectMany(report => report.ServiceTechnicianAnnualReport.Where(x=>!x.IsDeleted), (report, annualReport) => new
                {
                    report.Year,
                    annualReport.RefrigerantTypeId,
                    annualReport.RefrigerantType.Name,
                    annualReport.RefrigerantType.ASHRAEDesignation,
                    annualReport.RefrigerantType.ChemicalFormula,
                    annualReport.Purchased,
                    annualReport.Collected,
                    annualReport.Renewed,
                    annualReport.Sold,
                    annualReport.Used1,
                    annualReport.Used2,
                    annualReport.Used3,
                    annualReport.Used4,
                    annualReport.StockBalance,
                })
                 .GroupBy(r => new { r.Year, r.RefrigerantTypeId, r.Name,r.ASHRAEDesignation ,r.ChemicalFormula})
                .Select(g => new ServiceTechnicianAnnualReportSummaryDto
                {
                    RefrigerantTypeId = g.Key.RefrigerantTypeId,
                    Year = g.Key.Year,
                    RefrigerantTypeName = g.Key.Name,
                    RefrigerantTypeASHRAEDesignation = g.Key.ASHRAEDesignation,
                    RefrigerantTypeChemicalFormula = g.Key.ChemicalFormula,
                    TotalPurchased = g.Sum(r => r.Purchased ?? 0),
                    TotalCollected = g.Sum(r => r.Collected ?? 0),
                    TotalRenewed = g.Sum(r => r.Renewed ?? 0),
                    TotalSold = g.Sum(r => r.Sold ?? 0),
                    TotalUsed1 = g.Sum(r => r.Used1 ?? 0),
                    TotalUsed2 = g.Sum(r => r.Used2 ?? 0),
                    TotalUsed3 = g.Sum(r => r.Used3 ?? 0),
                    TotalUsed4 = g.Sum(r => r.Used4 ?? 0),
                    TotalStockBalance = g.Sum(r => r.StockBalance ?? 0),
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
                    ? summariesQuery.OrderBy(s => s.TotalPurchased)
                    : summariesQuery.OrderByDescending(s => s.TotalPurchased);
            }

            OrdinalPaginatedList<ServiceTechnicianAnnualReportSummaryDto> responseData;
            if (request.IsFromExport)
            {
                responseData = new OrdinalPaginatedList<ServiceTechnicianAnnualReportSummaryDto>(summariesQuery.ToList(), summariesQuery.ToList().Count, request.PageNumber, request.PageSize);
            }
            else
            {
                responseData = await summariesQuery
                .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
            }

                //var summaries = await summariesQuery
                //.OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);

            return responseData;

        }
    }
}

