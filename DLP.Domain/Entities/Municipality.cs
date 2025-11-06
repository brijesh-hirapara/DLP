using DLP.Domain.Common;
namespace DLP.Domain.Entities;

public class Municipality : SyncBase, IHasStateEntityId
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public Guid? CantonId { get; set; } // Foreign key, nullable
    public virtual Canton Canton { get; set; } // Navigation property
    public Guid StateEntityId { get; set; } // Foreign key
    public virtual StateEntity StateEntity { get; set; } // Navigation property
}

