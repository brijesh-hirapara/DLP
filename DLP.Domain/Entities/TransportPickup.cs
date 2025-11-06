namespace DLP.Domain.Entities
{
    public class TransportPickup
    {
        public Guid Id { get; set; }
        public string CompanyName { get; set; }
        public Guid CountryId { get; set; }
        public virtual Codebook Country { get; set; }
        public string City { get; set; }
        public string CompanyAddress { get; set; }
        public string PostalCode { get; set; }
        public Guid TransportRequestId { get; set; }
        public virtual TransportRequest TransportRequest { get; set; }
    }
}
