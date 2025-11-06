using DLP.Domain.Entities;

namespace DLP.Domain.Common;

public interface IAuditableEntity
{
    public DateTime CreatedAt { get; set; }
    public string? CreatedById { get; set; }
    public User CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedById { get; set; }
    public bool IsDeleted { get; set; }
}
