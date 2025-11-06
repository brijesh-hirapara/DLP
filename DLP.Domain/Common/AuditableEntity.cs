using DLP.Domain.Entities;

namespace DLP.Domain.Common;

public abstract class AuditableEntity<T> : IAuditableEntity
{
    public T Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedById { get; set; }
    public virtual User CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedById { get; set; }
    public virtual User UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }
}
