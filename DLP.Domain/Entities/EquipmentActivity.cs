using DLP.Domain.Common;

namespace DLP.Domain.Entities
{
    public class EquipmentActivity: SyncBase, IAuditableEntity
    {
        public Guid Id { get; set; }
        public Guid EquipmentId { get; set; }
        public virtual Equipment Equipment { get; set; }
        public DateTime DateOfChange { get; set; }
        public Guid TypeOfChangeId { get; set; }
        public virtual Codebook TypeOfChange { get; set; }
        public string? NewOperatorName { get; set; }
        public Guid? NewCoolantId { get; set; }
        public virtual RefrigerantType NewCoolant { get; set; }
        public string TechnicianCertificateNumber { get; set; }
        public string? Comments { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedById { get; set; }
        public User CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedById { get; set; }
        public bool IsDeleted { get; set; }

        public virtual ICollection<EquipmentActivityFile> EquipmentActivityFiles { get; set; }
        public bool HasPendingSyncFiles { get; set; }

        public void CleanIncludes()
        {
            CreatedBy = null;
            Equipment = null;
            TypeOfChange = null;
            NewCoolant = null;
        }

    }
}
