using System;
namespace DLP.Domain.Entities
{
    public class FileSynchronization
    {
        public required Guid Id { get; set; }
        public required Guid RelatedEntityId { get; set; }
        public required byte[] Data { get; set; }
        public required string Table { get; set; }
        public required string FileName { get; set; }

    }
}

