using DLP.Domain.Common;

namespace DLP.Domain.Entities
{
    public class ImportExportSubstancesAnnualReport : SyncBase, IAuditableEntity
    {
        public Guid Id { get; set; }
        public Guid ImportExportSubstancesReportId { get; set; }
        public virtual ImportExportSubstancesReport ImportExportSubstancesReport { get; set; }
        public Guid RefrigerantTypeId { get; set; }
        public virtual RefrigerantType RefrigerantType { get; set; }
        public decimal? TariffNumber { get; set; }
        public decimal? Import { get; set; }
        public decimal? OwnConsumption { get; set; }
        public decimal? SalesOnTheBiHMarket { get; set; }
        public decimal? TotalExportedQuantity { get; set; }
        public decimal? StockBalanceOnTheDay { get; set; }
        public string? EndUser { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedById { get; set; }
        public User CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedById { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsArchived { get; set; }
    }
}
