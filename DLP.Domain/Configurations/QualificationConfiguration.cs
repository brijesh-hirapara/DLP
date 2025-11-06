using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DLP.Domain.Configurations;

public class QualificationConfiguration : IEntityTypeConfiguration<Qualification>
{
    public void Configure(EntityTypeBuilder<Qualification> builder)
    {
        builder.HasOne(u => u.CertifiedTechnician)
               .WithMany(o => o.Qualifications)
               .HasForeignKey(u => u.CertifiedTechnicianId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.CreatedBy)
           .WithMany()
           .HasForeignKey(r => r.CreatedById)
           .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(r => r.QualificationFiles)
           .WithOne(d => d.Qualification)
           .HasForeignKey(d => d.QualificationId)
           .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(u => u.TrainingCenter)
            .WithMany(o => o.Qualifications)
            .HasForeignKey(u => u.TrainingCenterId)
            .OnDelete(DeleteBehavior.Cascade);


        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}

