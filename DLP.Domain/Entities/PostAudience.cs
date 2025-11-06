using System;
namespace DLP.Domain.Entities
{
    public class PostAudience
    {
        public Guid PostId { get; set; }
        public virtual Post Post { get; set; }
        public string RoleId { get; set; }
        public virtual Role Role { get; set; }
    }
}

