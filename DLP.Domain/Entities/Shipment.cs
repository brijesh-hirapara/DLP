using DLP.Domain.Enums;

namespace DLP.Domain.Entities
{
    public class Shipment
    {
        public Guid Id { get; set; }
        public string RequestId { get; set; } = string.Empty;
        public bool IsTruckAssigned { get; set; }
        public DateTime? TruckAssignedDate { get; set; }
        public bool IsPickupConfirmed { get; set; }
        public DateTime? PickupConfirmedDate { get; set; }
        public bool IsDeliveryConfirmed { get; set; }
        public DateTime? DeliveryConfirmedDate { get; set; }
        public bool IsPODUploaded { get; set; }
        public DateTime? PODUploadedDate { get; set; }
        public bool IsPODConfirmed { get; set; }
        public DateTime? PODConfirmedDate { get; set; }
        public ShipmentsCarrierStatus ShipmentCarrierStatus { get; set; }
        public ShipmentsStatus Status { get; set; }
        public Guid TransportRequestId { get; set; }
        public virtual TransportRequest TransportRequest { get; set; }
        public Guid? ShipperOrganizationId { get; set; }
        public virtual Organization? ShipperOrganization { get; set; }
        public Guid? CarrierOrganizationId { get; set; }
        public virtual Organization? CarrierOrganization { get; set; }

        public virtual List<UploadPODFile> UploadPODFiles { get; set; } = new List<UploadPODFile>();

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
