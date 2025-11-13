using DLP.Domain.Enums;

namespace DLP.Domain.Entities
{
    public class TransportRequest 
    {
        public Guid Id { get; set; }
        public string RequestId { get; set; } = string.Empty;
        public AccessibilityAvailable Accessibility { get; set; }
        public decimal TotalDistance { get; set; }
        public bool IsTemplate { get; set; } = false;
        public bool IsConfirmEvaluation { get; set; } = false;
        public DateTime? ConfirmEvaluationAt { get; set; }
        public string? TemplateName { get; set; }
        public TransportRequestStatus Status { get; set; }
        public Guid? OrganizationId { get; set; }
        public virtual Organization? Organization { get; set; }
        public List<TransportPickup> TransportPickup { get; set; } = new List<TransportPickup>();
        public List<TransportDelivery> TransportDelivery { get; set; } = new List<TransportDelivery>();
        public List<TransportGoods> TransportGoods { get; set; } = new List<TransportGoods>();
        public List<TransportInformation> TransportInformation { get; set; } = new List<TransportInformation>();
        public List<TransportCarrier> TransportCarrier { get; set; } = new List<TransportCarrier>();

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
