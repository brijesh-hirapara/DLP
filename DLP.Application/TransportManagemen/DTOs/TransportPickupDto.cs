using DLP.Application.Common.Mappings;
using DLP.Application.Requests.DTOs;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.TransportManagemen.DTOs
{
    public class TransportPickupDto
    {
        public Guid? Id { get; set; }
        public string CompanyName { get; set; }
        public Guid CountryId { get; set; }
        public string? CountryName { get; set; }
        public string City { get; set; }
        public string CompanyAddress { get; set; }
        public string PostalCode { get; set; }
        public void Mapping(TypeAdapterConfig config)
        {
            config.NewConfig<TransportPickup, TransportPickupDto>()
                .Map(dest => dest.CountryName, src => src.Country != null ? src.Country.Name : null);
        }
    }
}
