using DLP.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DLP.Domain.Configurations;
public class UserEntityConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // User to UserRole
        builder.HasMany(u => u.UserRoles)
               .WithOne(ur => ur.User)
               .HasForeignKey(ur => ur.UserId)
               .IsRequired();

        builder.HasMany(u => u.Qualifications)
               .WithOne(ur => ur.CertifiedTechnician)
               .HasForeignKey(ur => ur.CertifiedTechnicianId)
               .IsRequired();

        builder.HasOne(u => u.Organization)
               .WithMany(o => o.Employees)
               .HasForeignKey(u => u.OrganizationId)
               .OnDelete(DeleteBehavior.SetNull);

        //builder.HasQueryFilter(x => !x.IsDeleted);
    }
}

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(u => u.Id);
    }
}

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("Roles");
        builder.HasKey(r => r.Id);

        // Role to UserRole
        builder.HasMany(r => r.UserRoles)
               .WithOne(ur => ur.Role)
               .HasForeignKey(ur => ur.RoleId)
               .IsRequired();
    }
}

public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("UserRoles");
        builder.HasKey(ur => new { ur.UserId, ur.RoleId });
    }
}

public class RoleClaimConfiguration : IEntityTypeConfiguration<RoleClaim>
{
    public void Configure(EntityTypeBuilder<RoleClaim> builder)
    {
        builder.ToTable("RoleClaims");
        builder.HasKey(rc => rc.Id);

        // RoleClaim to Role
        builder.HasOne(rc => rc.Role)
               .WithMany(r => r.Claims)
               .HasForeignKey(rc => rc.RoleId)
               .IsRequired();
    }
}


public class UserClaimConfiguration : IEntityTypeConfiguration<IdentityUserClaim<string>>
{
    public void Configure(EntityTypeBuilder<IdentityUserClaim<string>> builder)
    {
        builder.ToTable("UserClaims");
        builder.HasKey(uc => uc.Id);
    }
}

public class UserLoginConfiguration : IEntityTypeConfiguration<IdentityUserLogin<string>>
{
    public void Configure(EntityTypeBuilder<IdentityUserLogin<string>> builder)
    {
        builder.ToTable("UserLogins");
        builder.HasKey(l => new { l.LoginProvider, l.ProviderKey });
    }
}

public class UserTokenConfiguration : IEntityTypeConfiguration<IdentityUserToken<string>>
{
    public void Configure(EntityTypeBuilder<IdentityUserToken<string>> builder)
    {
        builder.ToTable("UserTokens");
        builder.HasKey(ut => new { ut.UserId, ut.LoginProvider, ut.Name });

    }
}