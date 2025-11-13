using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;

namespace DLP.Application.TransportManagemen.DTOs
{
    public class TransportRequestDto : IMapFrom<TransportRequest>, IOrdinalNumber
    {
        public Guid Id { get; set; }
        public int OrdinalNumber { get; set; }
        public AccessibilityAvailable Accessibility { get; set; }
        public string ShipperName { get; set; }
        public int Status { get; set; }
        public string StatusDesc { get; set; }
        public decimal TotalDistance { get; set; }
        public Guid OrganizationId { get; set; }
        public string RequestId { get; set; }
        public int OfferCount { get; set; }
        public int AdminOfferCount { get; set; }
        public int CarrierCount { get; set; }
        public string LowestPrice { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsTemplate { get; set; }
        public bool IsForYourAction { get; set; }
        public string? TemplateName { get; set; }
        public string? CurrencyName { get; set; }
        public List<TransportPickupDto> TransportPickup { get; set; } = new List<TransportPickupDto>();
        public List<TransportDeliveryDto> TransportDelivery { get; set; } = new List<TransportDeliveryDto>();
        public List<TransportGoodsDto> TransportGoods { get; set; } = new List<TransportGoodsDto>();
        public List<TransportInformationDto> TransportInformation { get; set; } = new List<TransportInformationDto>();
        public List<TransportCarrierDto> TransportCarrier { get; set; } = new List<TransportCarrierDto>();


        public void Mapping(TypeAdapterConfig config)
        {
            config.NewConfig<TransportRequest, TransportRequestDto>()
                .Map(dest => dest.Status, src => (int)src.Status)
                .Map(dest => dest.StatusDesc, src => src.Status.ToString())
                .Map(dest => dest.ShipperName, src => src.Organization.Name)
                .Map(dest => dest.CurrencyName, src => src.TransportInformation != null &&
                                   src.TransportInformation.Any(ti => ti.Currency != null) ? src.TransportInformation.First().Currency.Name : null)
                .Map(dest => dest.OfferCount, src => src.TransportCarrier.Count(ti => !ti.IsDeleted && ti.IsAdminApproved))
                .Map(dest => dest.AdminOfferCount, src => src.TransportCarrier.Count(ti => !ti.IsDeleted && ti.Status == TransportCarrierStatus.Accepted))
                .Map(dest => dest.CarrierCount, src => src.TransportCarrier.Where(x=>!x.IsDeleted).Count())
                .Map(dest => dest.IsForYourAction, src => src.TransportCarrier
                                                     .Count(x => !x.IsDeleted
                                                              && x.Status == TransportCarrierStatus.Accepted
                                                              && x.IsAdminApproved
                                                              && x.IsShipperBook) > 0)
                .Map(dest => dest.LowestPrice, src => src.TransportCarrier != null ? src.TransportCarrier.Where(ti => ti.IsAdminApproved && ti.AdminApprovedPrice > 0)
                                                                                                         .OrderBy(ti => ti.AdminApprovedPrice)
                                                                                                         .Select(ti => ti.AdminApprovedPrice != null ? $"{ti.AdminApprovedPrice.Value.ToString("0.##")}" : null)
                                                                                                         .FirstOrDefault() ?? "0.00" : "0.00");
        }
    }
}