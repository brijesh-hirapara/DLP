using DLP.Application.ServiceTechnician.DTOs;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.ImportExportSubstances.DTOs
{
    public class ImportExportSubstancesAnnualReportDto
    {
        public Guid RefrigerantTypeId { get; set; }
        public string RefrigerantTypeName { get; set; }
        public string? RefrigerantTypeASHRAEDesignation { get; set; }
        public string? RefrigerantTypeChemicalFormula { get; set; }
        public decimal? TariffNumber { get; set; }
        public decimal? Import { get; set; }
        public decimal? OwnConsumption { get; set; }
        public decimal? SalesOnTheBiHMarket { get; set; }
        public decimal? TotalExportedQuantity { get; set; }
        public decimal? StockBalanceOnTheDay { get; set; }
        public string? EndUser { get; set; }
        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<ServiceTechnicianAnnualReport, ServiceTechnicianAnnualReportDto>()
                     .Map(dest => dest.RefrigerantTypeName, src => src.RefrigerantType != null ? src.RefrigerantType.Name : "");
        }
    }
}