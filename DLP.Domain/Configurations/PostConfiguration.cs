using System;
using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DLP.Domain.Configurations
{
    public class PostConfiguration : IEntityTypeConfiguration<Post>
    {
        public void Configure(EntityTypeBuilder<Post> builder)
        {
            // Primary Key
            builder.HasKey(p => p.Id);

            // Properties
            builder.Property(p => p.Subject)
                .IsRequired();

            builder.Property(p => p.Content)
                .IsRequired();

            builder.Property(p => p.CreatedAt)
                .IsRequired();

            builder.Property(p => p.CreatedById).IsRequired(true);

            builder.Property(p => p.UpdatedById).IsRequired(false);

            builder.Property(p => p.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.HasOne(p => p.CreatedBy)
                .WithMany() 
                .HasForeignKey(p => p.CreatedById)
                .OnDelete(DeleteBehavior.Restrict); 

            builder.HasQueryFilter(x => !x.IsDeleted);
        }
    }
}

