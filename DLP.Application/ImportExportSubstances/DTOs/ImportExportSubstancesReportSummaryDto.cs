using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.ImportExportSubstances.DTOs
{
    public class ImportExportSubstancesReportSummaryDto : IMapFrom<ImportExportSubstancesAnnualReport>, IOrdinalNumber
    {
        public Guid RefrigerantTypeId { get; set; }
        public int Year { get; set; }
        public string RefrigerantTypeName { get; set; }
        public string? RefrigerantTypeASHRAEDesignation { get; set; }
        public string? RefrigerantTypeChemicalFormula { get; set; }
        public decimal? TotalTariffNumber { get; set; }
        public decimal? TotalImport { get; set; }
        public decimal? TotalOwnConsumption { get; set; }
        public decimal? TotalSalesOnTheBiHMarket { get; set; }
        public decimal? TotalExportedQuantity { get; set; }
        public decimal? TotalStockBalanceOnTheDay { get; set; }
        public string? EndUser { get; set; }
        public int OrdinalNumber { get; set; }
        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<ImportExportSubstancesAnnualReport, ImportExportSubstancesReportSummaryDto>()
                .Map(dest => dest.RefrigerantTypeName, src => src.RefrigerantType != null ? src.RefrigerantType.Name : "");
        }
    }
}
