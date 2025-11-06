using DLP.Domain.Common;

namespace DLP.Domain.Entities
{
    public class ServiceTechnicianReport : SyncBase, IAuditableEntity
    {
        public Guid Id { get; set; }
        public int Year { get; set; }
        public string ResponsiblePerson { get; set; }
        public DateTime? SubmitedDate { get; set; }
        public Guid OrganizationId { get; set; }
        public virtual Organization Organization { get; set; }
        public Guid UserId { get; set; }
        public virtual User User { get; set; }
        public virtual List<ServiceTechnicianAnnualReport> ServiceTechnicianAnnualReport { get; set; } = new List<ServiceTechnicianAnnualReport>();
        public DateTime CreatedAt { get; set; }
        public string? CreatedById { get; set; }
        public User CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedById { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsArchived { get; set; }
    }
}
