namespace DLP.Domain.Entities
{
    public class VehicleFleetRequest
    {
        public Guid Id { get; set; }
        public int Status { get; set; }
        public string? Comments { get; set; }
        public Guid? OrganizationId { get; set; }
        public virtual Organization? Organization { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedById { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? ActionedAt { get; set; }
        public string? ActionedBy { get; set; }
    }
}
