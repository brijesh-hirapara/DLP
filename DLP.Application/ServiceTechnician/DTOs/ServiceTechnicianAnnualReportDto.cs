using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.ServiceTechnician.DTOs
{
    public class ServiceTechnicianAnnualReportDto
    {
        public Guid RefrigerantTypeId { get; set; }
        public string RefrigerantTypeName { get; set; }
        public string? RefrigerantTypeASHRAEDesignation { get; set; }
        public string? RefrigerantTypeChemicalFormula { get; set; }
        public decimal? Purchased { get; set; }
        public decimal? Collected { get; set; }
        public decimal? Renewed { get; set; }
        public decimal? Sold { get; set; }
        public decimal? Used1 { get; set; }
        public decimal? Used2 { get; set; }
        public decimal? Used3 { get; set; }
        public decimal? Used4 { get; set; }
        public Guid StateOfSubstanceId { get; set; }
        public string StateOfSubstanceName { get; set; }
        public decimal? StockBalance { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<ServiceTechnicianAnnualReport, ServiceTechnicianAnnualReportDto>()
                     .Map(dest => dest.RefrigerantTypeName, src => src.RefrigerantType != null ? src.RefrigerantType.Name : "");
        }
    }
}
