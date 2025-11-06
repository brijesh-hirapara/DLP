using System;
using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DLP.Domain.Configurations
{
    public class PostAudienceConfiguration : IEntityTypeConfiguration<PostAudience>
    {
        public void Configure(EntityTypeBuilder<PostAudience> builder)
        {
            // Composite Primary Key
            builder.HasKey(pa => new { pa.PostId, pa.RoleId });

            // Properties
            builder.Property(pa => pa.PostId)
                .IsRequired();

            builder.Property(pa => pa.RoleId)
                .IsRequired(); // Assuming this is a foreign key to a typical Identity Role table
        }
    }
}

