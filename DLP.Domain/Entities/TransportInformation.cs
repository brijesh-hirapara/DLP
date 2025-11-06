using DLP.Domain.Enums;

namespace DLP.Domain.Entities
{
    public class TransportInformation
    {
        public Guid Id { get; set; }
        public DateSelectionOption DateSelectionOption { get; set; } = DateSelectionOption.NoGrantedDates;
        public DateTime? PickupDateFrom { get; set; }
        public DateTime? PickupDateTo { get; set; }
        public string? PickupTimeFrom { get; set; }
        public string? PickupTimeTo { get; set; }
        public DateTime? DeliveryDateFrom { get; set; }
        public DateTime? DeliveryDateTo { get; set; }
        public string? DeliveryTimeFrom { get; set; }
        public string? DeliveryTimeTo { get; set; }
        public Guid? CurrencyId { get; set; }
        public virtual Codebook? Currency { get; set; }
        public Guid TransportRequestId { get; set; }
        public virtual TransportRequest TransportRequest { get; set; }
    }
}
