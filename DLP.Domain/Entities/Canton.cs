using System;
namespace DLP.Domain.Entities
{
    public class Canton : SyncBase
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid StateEntityId { get; set; } // Foreign key
        public virtual StateEntity StateEntity { get; set; } // Navigation property
    }

}

