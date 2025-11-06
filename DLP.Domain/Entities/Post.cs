using System;
using DLP.Domain.Common;

namespace DLP.Domain.Entities
{
    public class Post : IAuditableEntity
    {
        public Guid Id { get; set; }
        public string Subject { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedById { get; set; }
        public User CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedById { get; set; }
        public bool IsDeleted { get; set; }

        public virtual List<PostAudience> PostAudiences { get; set; }
    }
}

