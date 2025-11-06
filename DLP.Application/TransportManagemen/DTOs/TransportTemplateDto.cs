using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;

namespace DLP.Application.TransportManagemen.DTOs
{
    public class TransportTemplateDto : IMapFrom<TransportRequest>, IOrdinalNumber
    {
        public Guid Id { get; set; }
        public int OrdinalNumber { get; set; }
        public string? TemplateName { get; set; }
        public List<TransportPickupDto> TransportPickup { get; set; } = new List<TransportPickupDto>();
        public List<TransportDeliveryDto> TransportDelivery { get; set; } = new List<TransportDeliveryDto>();
        public List<TransportGoodsDto> TransportGoods { get; set; } = new List<TransportGoodsDto>();
        public DateTime CreatedAt { get; set; }
    }
}
