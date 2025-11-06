using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;

namespace DLP.Application.TransportManagemen.DTOs
{
    public class TransportInformationDto
    {
        public Guid? Id { get; set; }
        public DateSelectionOption DateSelectionOption { get; set; } = DateSelectionOption.NoGrantedDates;
        public DateTime? PickupDateFrom { get; set; }
        public DateTime? PickupDateTo { get; set; }
        public string? PickupTimeFrom { get; set; }
        public string? PickupTimeTo { get; set; }
        public DateTime? DeliveryDateFrom { get; set; }
        public DateTime? DeliveryDateTo { get; set; }
        public string? DeliveryTimeFrom { get; set; }
        public string? DeliveryTimeTo { get; set; }
        public Guid CurrencyId { get; set; }
        public string? CurrencyName { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.NewConfig<TransportInformation, TransportInformationDto>()
                .Map(dest => dest.CurrencyName, src => src.Currency != null ? src.Currency.Name : null);
        }
    }
}
