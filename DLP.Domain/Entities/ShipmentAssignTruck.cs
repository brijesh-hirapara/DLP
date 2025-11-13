namespace DLP.Domain.Entities
{
    public class ShipmentAssignTruck
    {
        public Guid Id { get; set; }
        public string RequestId { get; set; } = string.Empty;
        public string TruckDriverFirstName { get; set; }
        public string TruckDriverLastName { get; set; }
        public string PhoneNumber { get; set; }
        public string PassportId { get; set; }
        public string TruckNumber { get; set; }
        public Guid ShipmentId { get; set; }
        public virtual Shipment Shipment { get; set; }
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
