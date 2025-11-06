using DLP.Domain.Common;
using DLP.Domain.Enums;

namespace DLP.Domain.Entities;

public class Codebook : SyncBase, IAuditableEntity
{
    public Codebook()
    {

    }

    public Guid Id { get; set; }
    public string Name { get; set; }
    public CodebookTypeEnum Type { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedById { get; set; }
    public User CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedById { get; set; }
    public string? InternalCode { get; set; }
    public bool IsDeleted { get; set; }
}