using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DLP.Domain.Configurations;

public class CodebookConfiguration : IEntityTypeConfiguration<Codebook>
{
    public void Configure(EntityTypeBuilder<Codebook> builder)
    {
        //builder.HasQueryFilter(x => !x.IsDeleted);
    }
}

