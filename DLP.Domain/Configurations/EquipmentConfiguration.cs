using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DLP.Domain.Configurations;

public class EquipmentConfiguration : IEntityTypeConfiguration<Equipment>
{
    public void Configure(EntityTypeBuilder<Equipment> builder)
    {
        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.CompanyBranch)
            .WithMany(cb => cb.Equipments)
            .HasForeignKey(e => e.CompanyBranchId);

        builder.HasOne(e => e.TypeOfEquipment)
            .WithMany()
            .HasForeignKey(e => e.TypeOfEquipmentId).IsRequired(true)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.TypeOfCoolingSystem)
            .WithMany()
            .HasForeignKey(e => e.TypeOfCoolingSystemId).IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.PurposeOfEquipment)
            .WithMany()
            .HasForeignKey(e => e.PurposeOfEquipmentId).IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);
            
        builder.HasOne(e => e.CreatedBy)
            .WithMany()
            .HasForeignKey(e => e.CreatedById).OnDelete(DeleteBehavior.Cascade);

        builder.Property(e => e.SerialNumber)
            .HasMaxLength(255)
            .IsRequired(false);

        builder.Property(e => e.IsDeleted)
            .HasDefaultValue(false);

        builder.Property(e => e.IsArchived)
        .HasDefaultValue(false);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}

