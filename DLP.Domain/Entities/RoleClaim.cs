using Microsoft.AspNetCore.Identity;

namespace DLP.Domain.Entities;
public class RoleClaim : IdentityRoleClaim<string>
{
    public virtual Role Role { get; set; }
}
