using DLP.Domain.Common;

namespace DLP.Domain.Entities;

public class Qualification : SyncBase, IAuditableEntity
{
    public Guid Id { get; set; }
    public string CertifiedTechnicianId { get; set; }
    public virtual User CertifiedTechnician { get; set; }
    public DateTime DateOfExam { get; set; }
    public string CertificateNumber { get; set; }
    public DateTime CertificateDuration { get; set; }
    public Guid QualificationTypeId { get; set; }
    public virtual Codebook QualificationType {get;set;}
    public Guid TrainingCenterId { get; set; }
    public virtual Organization TrainingCenter { get; set; }
    public List<QualificationFile> QualificationFiles { get; set; } = new List<QualificationFile>();
    public DateTime CreatedAt { get; set; }
    public string? CreatedById { get; set; }
    public User CreatedBy { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedById { get; set; }

    public bool HasPendingSyncFiles { get; set; }

    public void CleanIncludes()
    {
        CertifiedTechnician = null;
        TrainingCenter = null;
        CreatedBy = null;
    }
}
