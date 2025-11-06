using DLP.Domain.Common;

namespace DLP.Domain.Entities
{
    public class EmailOption : IAuditableEntity
    {
        public Guid Id { get; set; }
        public string From { get; set; }
        public string SmtpHost { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUser { get; set; }
        public string SmtpPass { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedById { get; set; }
        public User CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedById { get; set; }
    }
}
