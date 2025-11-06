using DLP.Domain.Common;

namespace DLP.Domain.Entities;

public class CompanyBranch : SyncBase, IAuditableEntity
{
    public Guid Id { get; set; }
    public string BranchOfficeName { get; set; }
    public string IdNumber { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? ContactPerson { get; set; }
    public string? ContactPhone { get; set; }
    public string? Place { get; set; }
    public Guid MunicipalityId { get; set; }
    public virtual Municipality Municipality { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedById { get; set; }
    public virtual User CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedById { get; set; }
    public bool IsDeleted { get; set; }
    public Guid OrganizationId { get; set; }
    public virtual Organization Organization { get; set; }
    public virtual ICollection<Equipment> Equipments { get; set; }
}
