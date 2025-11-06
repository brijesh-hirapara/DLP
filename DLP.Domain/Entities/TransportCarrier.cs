using DLP.Domain.Enums;

namespace DLP.Domain.Entities
{
    public class TransportCarrier
    {
        public Guid Id { get; set; }
        public decimal? Price { get; set; }
        public decimal? ProfitMargin { get; set; }
        public decimal? AdminApprovedPrice { get; set; }
        public bool IsAdminApproved { get; set; } = false;
        public int? OfferValidityDate { get; set; }
        public DateTime? EstimatedPickupDateTimeFrom { get; set; }
        public DateTime? EstimatedPickupDateTimeTo { get; set; }
        public DateTime? EstimatedDeliveryDateTimeFrom { get; set; }
        public DateTime? EstimatedDeliveryDateTimeTo { get; set; }

        public DateTime? ExpiryDateTime { get; set; }
        public bool IsExpired { get; set; }
        public bool IsScheduleDiffers { get; set; }
        public bool IsShipperBook { get; set; }
        public TransportCarrierStatus Status { get; set; }
        public TransportCarrierInvitationStatus InvitationStatus { get; set; }
        public Guid? TruckTypeId { get; set; }
        public virtual Codebook TruckType { get; set; }
        public Guid OrganizationId { get; set; }
        public virtual Organization Organization { get; set; }
        public Guid TransportRequestId { get; set; }
        public virtual TransportRequest TransportRequest { get; set; }
        // Audit
        public DateTime CreatedAt { get; set; }
        public string? CreatedById { get; set; }
        //public virtual User CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedById { get; set; }
        //public virtual User? UpdatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }

    }
}
