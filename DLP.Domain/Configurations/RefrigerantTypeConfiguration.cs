using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DLP.Domain.Configurations;

public class RefrigerantTypeConfiguration : IEntityTypeConfiguration<RefrigerantType>
{
    public void Configure(EntityTypeBuilder<RefrigerantType> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name)
            .IsRequired();

        builder.HasOne(r => r.CreatedBy)
            .WithMany()
            .HasForeignKey(r => r.CreatedById);

        builder.Property(r => r.IsDeleted)
            .HasDefaultValue(false);
    }
}

