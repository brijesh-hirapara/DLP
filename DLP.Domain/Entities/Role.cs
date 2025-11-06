using DLP.Domain.Common;
using DLP.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace DLP.Domain.Entities;
public class Role : IdentityRole, IAuditableEntity
{
    public AccessLevelType AccessLevel { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedById { get; set; }
    public User CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedById { get; set; }
    public bool IsDeleted { get; set; }
    public ICollection<UserRole> UserRoles { get; set; }
    public ICollection<RoleClaim> Claims { get; set; } = new List<RoleClaim>();

    public virtual ICollection<PostAudience> PostAudiences { get; set; } 

}
