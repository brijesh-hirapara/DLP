
using DLP.Domain.Common;

namespace DLP.Domain.Entities
{
    public class ServiceTechnicianAnnualReport : SyncBase, IAuditableEntity
    {
        public Guid Id { get; set; }
        public Guid ServiceTechnicianReportId { get; set; }
        public virtual ServiceTechnicianReport ServiceTechnicianReport { get; set; }     
        public Guid RefrigerantTypeId { get; set; }
        public virtual RefrigerantType RefrigerantType { get; set; }
        public decimal? Purchased { get; set; }
        public decimal? Collected { get; set; }
        public decimal? Renewed { get; set; }
        public decimal? Sold { get; set; }
        public decimal? Used1 { get; set; }
        public decimal? Used2 { get; set; }
        public decimal? Used3 { get; set; }
        public decimal? Used4 { get; set; }
        public Guid StateOfSubstanceId { get; set; }
        public decimal? StockBalance { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedById { get; set; }
        public User CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedById { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsArchived { get; set; }
    }
}
