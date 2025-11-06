using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DLP.Domain.Configurations;

public class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
{
    public void Configure(EntityTypeBuilder<Organization> builder)
    {
        builder.HasMany(o => o.Employees)
               .WithOne(e => e.Organization)
               .HasForeignKey(e => e.OrganizationId)
               .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(o => o.CreatedBy)
               .WithMany()
               .HasForeignKey(o => o.CreatedById)
               .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(o => o.UpdatedBy)
               .WithMany()
               .HasForeignKey(o => o.UpdatedById)
               .OnDelete(DeleteBehavior.SetNull);

       builder.HasOne(o => o.ContactPerson)
              .WithMany()
              .HasForeignKey(o => o.ContactPersonId)
              .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(r => r.IdNumber).IsUnique();
        builder.HasIndex(r => r.LicenseId).IsUnique();
        builder.Property(o => o.Status)
           .HasDefaultValue(OrganizationStatus.Active);
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}



