using System;
namespace DLP.Domain.Entities
{
    public class EquipmentFile:SyncBase
    {
        public Guid Id { get; set; }
        public Guid EquipmentId { get; set; }
        public virtual Equipment Equipment { get; set; }
        public string FilePath { get; set; }
        public string FileName { get; set; }
        public long Size { get; set; } // In bytes.
        public string ContentType { get; set; } // E.g., "image/jpeg", "application/pdf"
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; }
    }
}

