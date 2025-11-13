using System.ComponentModel;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;

namespace DLP.Application.TransportManagemen.DTOs
{
    public class TransportCarrierDto
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public decimal? Price { get; set; }
        public int? OfferValidityDate { get; set; }
        public DateTime? EstimatedPickupDateTimeFrom { get; set; }
        public DateTime? EstimatedPickupDateTimeTo { get; set; }
        public DateTime? EstimatedDeliveryDateTimeFrom { get; set; }
        public DateTime? EstimatedDeliveryDateTimeTo { get; set; }
        public int Status { get; set; }
        public string StatusDesc
        {
            get
            {
                return ((TransportCarrierStatus)Status).GetDescription();
            }
        }

        public int InvitationStatus { get; set; }
        public string InvitationStatusDesc
        {
            get
            {
                return ((TransportCarrierInvitationStatus)InvitationStatus).GetDescription();
            }
        }

        public Guid? TruckTypeId { get; set; }
        public string TruckTypeName { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.NewConfig<TransportCarrier, TransportCarrierDto>()
                .Map(dest => dest.Status, src => (int)src.Status)
                .Map(dest => dest.InvitationStatus, src => (int)src.InvitationStatus)
                .Map(dest => dest.TruckTypeName, src => src.TruckType != null ? src.TruckType.Name : null)
                ;
        }
    }

    public static class EnumExtensions
    {
        public static string GetDescription(this Enum value)
        {
            var field = value.GetType().GetField(value.ToString());
            var attr = field?.GetCustomAttributes(typeof(DescriptionAttribute), false)
                             .FirstOrDefault() as DescriptionAttribute;
            return attr?.Description ?? value.ToString();
        }
    }


    public class TransportCarrierListDto : IMapFrom<TransportCarrier>, IOrdinalNumber
    {
        public Guid Id { get; set; }
        public int OrdinalNumber { get; set; }
        public Guid OrganizationId { get; set; }
        public string OrganizationName { get; set; }
        public string ShipperName { get; set; }
        public int InvitationStatus { get; set; }
        public string InvitationStatusDesc
        {
            get
            {
                return ((TransportCarrierInvitationStatus)InvitationStatus).GetDescription();
            }
        }
        public int Status { get; set; }
        public string StatusDesc
        {
            get
            {
                return ((TransportCarrierStatus)Status).GetDescription();
            }
        }

        public void Mapping(TypeAdapterConfig config)
        {
            config.NewConfig<TransportCarrier, TransportCarrierListDto>()
                .Map(dest => dest.InvitationStatus, src => (int)src.InvitationStatus)
                .Map(dest => dest.Status, src => (int)src.Status)
                .Map(dest => dest.ShipperName, src => src.TransportRequest.Organization.Name)
                .Map(dest => dest.OrganizationName, src => src.Organization.Name);
        }
    }


    public class TransportCarrierAdminOfferDto : IMapFrom<TransportCarrier>, IOrdinalNumber
    {
        public Guid Id { get; set; }
        public int OrdinalNumber { get; set; }
        public Guid OrganizationId { get; set; }
        public decimal? Price { get; set; }
        public decimal? ProfitMargin { get; set; }
        public decimal? AdminApprovedPrice { get; set; }
        public int? OfferValidityDate { get; set; }
        public DateTime? EstimatedPickupDateTimeFrom { get; set; }
        public DateTime? EstimatedPickupDateTimeTo { get; set; }
        public DateTime? EstimatedDeliveryDateTimeFrom { get; set; }
        public DateTime? EstimatedDeliveryDateTimeTo { get; set; }
        public DateTime? ExpiryDateTime { get; set; }
        public bool IsExpired { get; set; }
        public bool IsScheduleDiffers { get; set; }
        public bool IsAdminApproved { get; set; } = false;
        public bool IsShipperBook { get; set; } = false;
        public int Status { get; set; }
        public string StatusDesc
        {
            get
            {
                return ((TransportCarrierStatus)Status).GetDescription();
            }
        }

        public int InvitationStatus { get; set; }
        public string InvitationStatusDesc
        {
            get
            {
                return ((TransportCarrierInvitationStatus)InvitationStatus).GetDescription();
            }
        }

        public Guid? TruckTypeId { get; set; }
        public string TruckTypeName { get; set; }
        public string CurrencyName { get; set; }
        public DateTime? PickupDateFrom { get; set; }
        public DateTime? PickupDateTo { get; set; }
        public string? PickupTimeFrom { get; set; }
        public string? PickupTimeTo { get; set; }
        public DateTime? DeliveryDateFrom { get; set; }
        public DateTime? DeliveryDateTo { get; set; }
        public string? DeliveryTimeFrom { get; set; }
        public string? DeliveryTimeTo { get; set; }
        public bool IsConfirmEvaluation { get; set; } = false;
        public DateTime? ConfirmEvaluationAt { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.NewConfig<TransportCarrier, TransportCarrierAdminOfferDto>()
                .Map(dest => dest.Status, src => (int)src.Status)
                .Map(dest => dest.InvitationStatus, src => (int)src.InvitationStatus)
                .Map(dest => dest.TruckTypeName, src => src.TruckType != null ? src.TruckType.Name : null)
                .Map(dest => dest.PickupDateFrom, src => src.TransportRequest.TransportInformation.Select(ti => ti.PickupDateFrom).FirstOrDefault())
                .Map(dest => dest.PickupDateTo, src => src.TransportRequest.TransportInformation.Select(ti => ti.PickupDateTo).FirstOrDefault())
                .Map(dest => dest.PickupTimeFrom, src => src.TransportRequest.TransportInformation.Select(ti => ti.PickupTimeFrom).FirstOrDefault())
                .Map(dest => dest.PickupTimeTo, src => src.TransportRequest.TransportInformation.Select(ti => ti.PickupTimeTo).FirstOrDefault())
                .Map(dest => dest.DeliveryDateFrom, src => src.TransportRequest.TransportInformation.Select(ti => ti.DeliveryDateFrom).FirstOrDefault())
                .Map(dest => dest.DeliveryDateTo, src => src.TransportRequest.TransportInformation.Select(ti => ti.DeliveryDateTo).FirstOrDefault())
                .Map(dest => dest.DeliveryTimeFrom, src => src.TransportRequest.TransportInformation.Select(ti => ti.DeliveryTimeFrom).FirstOrDefault())
                .Map(dest => dest.DeliveryTimeTo, src => src.TransportRequest.TransportInformation.Select(ti => ti.DeliveryTimeTo).FirstOrDefault())
                .Map(dest => dest.IsConfirmEvaluation, src => src.TransportRequest.IsConfirmEvaluation)
                .Map(dest => dest.ConfirmEvaluationAt, src => src.TransportRequest.ConfirmEvaluationAt)
                .Map(dest => dest.CurrencyName, src => src.TransportRequest.TransportInformation != null &&
                                   src.TransportRequest.TransportInformation.Any(ti => ti.Currency != null) ? src.TransportRequest.TransportInformation.First().Currency.Name : null);
            ;
        }
    }


    public class TransportCarrierChooseOfferDto : IMapFrom<TransportCarrier>, IOrdinalNumber
    {
        public Guid Id { get; set; }
        public int OrdinalNumber { get; set; }
        public Guid OrganizationId { get; set; }
        public decimal? AdminApprovedPrice { get; set; }
        public int? OfferValidityDate { get; set; }
        public DateTime? EstimatedPickupDateTimeFrom { get; set; }
        public DateTime? EstimatedPickupDateTimeTo { get; set; }
        public DateTime? EstimatedDeliveryDateTimeFrom { get; set; }
        public DateTime? EstimatedDeliveryDateTimeTo { get; set; }
        public DateTime? ExpiryDateTime { get; set; }
        public bool IsExpired { get; set; }
        public bool IsScheduleDiffers { get; set; }
        public bool IsAdminApproved { get; set; } = false;
        public bool IsShipperBook { get; set; } = false;
        public DateTime ShipperBookAt { get; set; }
        public int Status { get; set; }
        public string StatusDesc
        {
            get
            {
                return ((TransportCarrierStatus)Status).GetDescription();
            }
        }

        public int InvitationStatus { get; set; }
        public string InvitationStatusDesc
        {
            get
            {
                return ((TransportCarrierInvitationStatus)InvitationStatus).GetDescription();
            }
        }

        public Guid? TruckTypeId { get; set; }
        public string TruckTypeName { get; set; }
        public string CurrencyName { get; set; }
        public DateTime? PickupDateFrom { get; set; }
        public DateTime? PickupDateTo { get; set; }
        public string? PickupTimeFrom { get; set; }
        public string? PickupTimeTo { get; set; }
        public DateTime? DeliveryDateFrom { get; set; }
        public DateTime? DeliveryDateTo { get; set; }
        public string? DeliveryTimeFrom { get; set; }
        public string? DeliveryTimeTo { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.NewConfig<TransportCarrier, TransportCarrierChooseOfferDto>()
                .Map(dest => dest.Status, src => (int)src.Status)
                .Map(dest => dest.InvitationStatus, src => (int)src.InvitationStatus)
                .Map(dest => dest.TruckTypeName, src => src.TruckType != null ? src.TruckType.Name : null)
                .Map(dest => dest.CurrencyName, src => src.TransportRequest.TransportInformation != null &&
                                   src.TransportRequest.TransportInformation.Any(ti => ti.Currency != null) ? src.TransportRequest.TransportInformation.First().Currency.Name : null)
                .Map(dest => dest.PickupDateFrom, src => src.TransportRequest.TransportInformation .Select(ti => ti.PickupDateFrom).FirstOrDefault())
                .Map(dest => dest.PickupDateTo, src => src.TransportRequest.TransportInformation.Select(ti => ti.PickupDateTo).FirstOrDefault())
                .Map(dest => dest.PickupTimeFrom, src => src.TransportRequest.TransportInformation.Select(ti => ti.PickupTimeFrom).FirstOrDefault())
                .Map(dest => dest.PickupTimeTo, src => src.TransportRequest.TransportInformation.Select(ti => ti.PickupTimeTo).FirstOrDefault())
                .Map(dest => dest.DeliveryDateFrom, src => src.TransportRequest.TransportInformation.Select(ti => ti.DeliveryDateFrom).FirstOrDefault())
                .Map(dest => dest.DeliveryDateTo, src => src.TransportRequest.TransportInformation.Select(ti => ti.DeliveryDateTo).FirstOrDefault())
                .Map(dest => dest.DeliveryTimeFrom, src => src.TransportRequest.TransportInformation.Select(ti => ti.DeliveryTimeFrom).FirstOrDefault())
                .Map(dest => dest.DeliveryTimeTo, src => src.TransportRequest.TransportInformation.Select(ti => ti.DeliveryTimeTo).FirstOrDefault());
            ;
        }
    }


    public class TransportCarrierAdminApprovedOfferDto
    {
        public Guid Id { get; set; }
        public decimal? ProfitMargin { get; set; }
        public decimal? AdminApprovedPrice { get; set; }
    }
}