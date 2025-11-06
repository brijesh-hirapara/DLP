using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.ServiceTechnician.DTOs
{
    public class ServiceTechnicianAnnualReportSummaryDto: IMapFrom<ServiceTechnicianAnnualReport>, IOrdinalNumber
    {
        public Guid RefrigerantTypeId { get; set; }
        public int Year { get; set; }
        public string RefrigerantTypeName { get; set; }
        public string? RefrigerantTypeASHRAEDesignation { get; set; }
        public string? RefrigerantTypeChemicalFormula { get; set; }
        public decimal TotalPurchased { get; set; }
        public decimal TotalCollected { get; set; }
        public decimal TotalRenewed { get; set; }
        public decimal TotalSold { get; set; }
        public decimal TotalUsed1 { get; set; }
        public decimal TotalUsed2 { get; set; }
        public decimal TotalUsed3 { get; set; }
        public decimal TotalUsed4 { get; set; }
        public decimal TotalStockBalance { get; set; }
   
        public int OrdinalNumber { get; set; }
        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<ServiceTechnicianAnnualReport, ServiceTechnicianAnnualReportSummaryDto>()
                .Map(dest => dest.RefrigerantTypeName, src => src.RefrigerantType != null ? src.RefrigerantType.Name : "");
        }
    }
}
