using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DLP.Domain.Configurations;

public class EquipmentActivityConfiguration : IEntityTypeConfiguration<EquipmentActivity>
{
    public void Configure(EntityTypeBuilder<EquipmentActivity> builder)
    {
        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.TypeOfChange)
            .WithMany()
            .HasForeignKey(e => e.TypeOfChangeId)
            .IsRequired(true);

        builder.HasOne(e => e.CreatedBy)
            .WithMany()
            .HasForeignKey(e => e.CreatedById);

        builder.HasOne(e => e.NewCoolant)
        .WithMany()
        .HasForeignKey(e => e.NewCoolantId)
        .IsRequired(false);

        builder.Property(e => e.TechnicianCertificateNumber).IsRequired(true);

        builder.Property(e => e.Comments).IsRequired(false);

        builder.Property(e => e.IsDeleted)
            .HasDefaultValue(false);
    }
}

