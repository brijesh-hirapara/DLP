using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DLP.Domain.Configurations;

public class CompanyBranchConfiguration : IEntityTypeConfiguration<CompanyBranch>
{
    public void Configure(EntityTypeBuilder<CompanyBranch> builder)
    {
        builder.HasMany(cb => cb.Equipments)
           .WithOne(e => e.CompanyBranch)
           .HasForeignKey(e => e.CompanyBranchId)
           .OnDelete(DeleteBehavior.Cascade);


        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
