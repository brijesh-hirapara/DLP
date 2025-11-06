using DLP.Domain.Common;

namespace DLP.Domain.Entities
{
    public class Employment : SyncBase
    {
        public Guid Id { get; set; }
        public string CertifiedTechnicianId { get; set; }
        public virtual User CertifiedTechnician { get; set; }
        public Guid CompanyId { get; set; }
        public virtual Organization Company { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
