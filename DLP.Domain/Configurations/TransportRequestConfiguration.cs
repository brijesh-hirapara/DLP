namespace DLP.Domain.Configurations
{
    //public class TransportRequestConfiguration : IEntityTypeConfiguration<TransportRequest>
    //{
    //    public void Configure(EntityTypeBuilder<TransportRequest> builder)
    //    {
    //        //builder.HasOne(e => e.CreatedBy)
    //        //.WithMany()
    //        //.HasForeignKey(e => e.CreatedById);

    //        //builder.HasOne(o => o.UpdatedBy)
    //        //       .WithMany()
    //        //       .HasForeignKey(o => o.UpdatedById)
    //        //       .OnDelete(DeleteBehavior.SetNull);

    //        //builder.HasMany(o => o.TransportPickup)
    //        //       .WithOne(e => e.TransportRequest)
    //        //       .HasForeignKey(e => e.TransportId)
    //        //       .OnDelete(DeleteBehavior.SetNull);

    //        //builder.HasMany(o => o.TransportDelivery)
    //        //       .WithOne(e => e.TransportRequest)
    //        //       .HasForeignKey(e => e.TransportId)
    //        //       .OnDelete(DeleteBehavior.SetNull);

    //        //builder.HasMany(o => o.TransportGoods)
    //        //       .WithOne(e => e.TransportRequest)
    //        //       .HasForeignKey(e => e.TransportId)
    //        //       .OnDelete(DeleteBehavior.SetNull);

    //        //builder.HasMany(o => o.TransportInformation)
    //        //       .WithOne(e => e.TransportRequest)
    //        //       .HasForeignKey(e => e.TransportId)
    //        //       .OnDelete(DeleteBehavior.SetNull);

    //        //builder.HasMany(o => o.TransportCarrier)
    //        //       .WithOne(e => e.TransportRequest)
    //        //       .HasForeignKey(e => e.TransportId)
    //        //       .OnDelete(DeleteBehavior.SetNull);

    //        //builder.Property(o => o.Status)
    //        //   .HasDefaultValue(TransportRequestStatus.Active);
    //        //builder.HasQueryFilter(x => !x.IsDeleted);
    //    }
    //}
}