using DLP.Application.Common.DTOs;
using System.ComponentModel.DataAnnotations.Schema;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Equipments.DTOs;
using DLP.Application.TransportManagemen.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;

namespace DLP.Application.Shipments.DTOs
{
    public class ShipmentsDto : IMapFrom<Shipment>, IOrdinalNumber
    {
        public Guid Id { get; set; }
        public int OrdinalNumber { get; set; }
        public string RequestId { get; set; } = string.Empty;
        public decimal TotalDistance { get; set; }
        public bool IsTruckAssigned { get; set; }
        public DateTime? TruckAssignedDate { get; set; }
        public bool IsPickupConfirmed { get; set; }
        public DateTime? PickupConfirmedDate { get; set; }
        public DateTime? RequestCreatedAt { get; set; }
        public DateTime? OfferBookedAt { get; set; }
        public bool IsDeliveryConfirmed { get; set; }
        public DateTime? DeliveryConfirmedDate { get; set; }
        public bool IsPODUploaded { get; set; }
        public DateTime? PODUploadedDate { get; set; }
        public bool IsPODConfirmed { get; set; }
        public DateTime? PODConfirmedDate { get; set; }
        public int ShipmentCarrierStatus { get; set; }
        public string ShipmentCarrierStatusDesc
        {
            get
            {
                return ((ShipmentsCarrierStatus)ShipmentCarrierStatus).GetDescription();
            }
        }
        public int Status { get; set; }
        public string StatusDesc { get; set; }
        public Guid? ShipperOrganizationId { get; set; }
        public string? ShipperName { get; set; }
        public Guid? CarrierOrganizationId { get; set; }
        public string? CarrierName { get; set; }
        public string? CurrencyName { get; set; }
        public Guid TransportRequestId { get; set; }
        public List<TransportPickupDto> TransportPickup { get; set; } = new List<TransportPickupDto>();
        public List<TransportDeliveryDto> TransportDelivery { get; set; } = new List<TransportDeliveryDto>();
        public List<TransportGoodsDto> TransportGoods { get; set; } = new List<TransportGoodsDto>();
        public List<CarrierTransportCarrierDto> TransportCarrier { get; set; } = new List<CarrierTransportCarrierDto>();
        public ShipmentAssignTruckDto ShipmentAssignTrucks { get; set; } = new ShipmentAssignTruckDto();
        public List<FileResultDto> UploadPODFiles { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.NewConfig<Shipment, ShipmentsDto>()
                .Map(dest => dest.TotalDistance, src => src.TransportRequest.TotalDistance)
                .Map(dest => dest.Status, src => (int)src.Status)
                .Map(dest => dest.StatusDesc, src => src.Status.ToString())
                .Map(dest => dest.ShipmentCarrierStatus, src => (int)src.ShipmentCarrierStatus)
                .Map(dest => dest.ShipperName, src => src.ShipperOrganization.Name)
                .Map(dest => dest.CarrierName, src => src.CarrierOrganization.Name)
                .Map(dest => dest.RequestCreatedAt, src => src.TransportRequest.CreatedAt)
                .Map(dest => dest.OfferBookedAt, src => src.CreatedAt)
                .Map(dest => dest.CurrencyName, src => src.TransportRequest.TransportInformation != null &&
                                   src.TransportRequest.TransportInformation.Any(ti => ti.Currency != null) ? src.TransportRequest.TransportInformation.First().Currency.Name : null)
                .Map(dest => dest.TransportPickup, src => src.TransportRequest.TransportPickup)
                .Map(dest => dest.TransportDelivery, src => src.TransportRequest.TransportDelivery)
                .Map(dest => dest.TransportGoods, src => src.TransportRequest.TransportGoods)
                .Map(dest => dest.TransportCarrier, src => src.TransportRequest.TransportCarrier)
                .Map(dest => dest.UploadPODFiles, src => src.UploadPODFiles != null
                                ? src.UploadPODFiles.Select(f => new FileResultDto
                                {
                                    Id = f.Id,
                                    ContentType = f.ContentType,
                                    FileName = f.FileName,
                                    FileContents = System.IO.File.Exists(f.FilePath)
                                        ? System.IO.File.ReadAllBytes(f.FilePath)
                                        : Array.Empty<byte>(),
                                }).ToList()
                                : new List<FileResultDto>());
            
        }
    }


    public class CarrierTransportCarrierDto : IMapFrom<TransportCarrier>
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public decimal? Price { get; set; }
        public decimal? ProfitMargin { get; set; }
        public decimal? AdminApprovedPrice { get; set; }
        public DateTime? EstimatedPickupDateTimeFrom { get; set; }
        public DateTime? EstimatedPickupDateTimeTo { get; set; }
        public DateTime? EstimatedDeliveryDateTimeFrom { get; set; }
        public DateTime? EstimatedDeliveryDateTimeTo { get; set; }
        public DateTime? ExpiryDateTime { get; set; }
        public int Status { get; set; }
        public string StatusDesc
        {
            get
            {
                return ((TransportCarrierStatus)Status).GetDescription();
            }
        }

        public Guid? TruckTypeId { get; set; }
        public string TruckTypeName { get; set; }
       

        public void Mapping(TypeAdapterConfig config)
        {
            config.NewConfig<TransportCarrier, CarrierTransportCarrierDto>()
                .Map(dest => dest.Status, src => (int)src.Status)
                .Map(dest => dest.TruckTypeName, src => src.TruckType != null ? src.TruckType.Name : null)
            ;
        }
    }
}