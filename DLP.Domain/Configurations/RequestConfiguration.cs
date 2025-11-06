using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DLP.Domain.Configurations;

public class RequestConfiguration : IEntityTypeConfiguration<Request>
{
    public void Configure(EntityTypeBuilder<Request> builder)
    {
        builder.HasOne(r => r.Company)
               .WithMany(o => o.Requests)
               .HasForeignKey(r => r.CompanyId)
               .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(r => r.CreatedBy)
               .WithMany()
               .HasForeignKey(r => r.CreatedById)
               .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(r => r.UpdatedBy)
               .WithMany()
               .HasForeignKey(r => r.UpdatedById)
               .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(r => r.Attachments)
           .WithOne(d => d.Request)
           .HasForeignKey(d => d.RequestId)
           .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}

