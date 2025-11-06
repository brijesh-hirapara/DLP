using System;
namespace DLP.Domain.Entities
{
    public class EquipmentActivityFile:SyncBase
    {
        public Guid Id { get; set; }
        public Guid EquipmentActivityId { get; set; }
        public virtual EquipmentActivity EquipmentActivity { get; set; }
        public string FilePath { get; set; }
        public string FileName { get; set; }
        public long Size { get; set; } // In bytes.
        public string ContentType { get; set; } // E.g., "image/jpeg", "application/pdf"
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; }
    }
}

