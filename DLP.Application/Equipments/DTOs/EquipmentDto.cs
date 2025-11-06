using DLP.Application.Common.DTOs;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using Mapster;
using System.ComponentModel.DataAnnotations.Schema;

namespace DLP.Application.Equipments.DTOs;

public class EquipmentDto : IMapFrom<Equipment>, IOrdinalNumber
{
    public Guid Id { get; set; }
    public Guid CompanyBranchId { get; set; }
    public string BranchOfficeName { get; set; }
    public string CompanyName { get; set; }
    public Guid? TypeOfEquipmentId { get; set; }
    public string? TypeOfEquipment { get; set; }
    public string? TypeOfEquipmentOther { get; set; }
    public Guid? TypeOfCoolingSystemId { get; set; }
    public string? TypeOfCoolingSystem { get; set; }
    public string? TypeOfCoolingSystemOther { get; set; }
    public string? Manufacturer { get; set; }
    public string? Type { get; set; }
    public string? Model { get; set; }
    public string SerialNumber { get; set; }
    public int? YearOfProduction { get; set; }
    public DateTime? DateOfPurchase { get; set; }
    public Guid? RefrigerantTypeId { get; set; }
    public string RefrigerantType { get; set; }
    public double? MassOfRefrigerantKg { get; set; }
    public Guid? PurposeOfEquipmentId { get; set; }
    public string PurposeOfEquipment { get; set; }
    public double? CoolingTemperature { get; set; }
    public double? CoolingEffectKw { get; set; }
    public double? CompressorConnectionPowerKw { get; set; }
    public double? LiquidCollectorVolume { get; set; }
    public double? MassAddedLastYearInKg { get; set; }
    public DateTime? CommissioningDate { get; set; }
    public string? Comments { get; set; }
    public int OrdinalNumber { get; set; }
    public string TaxNumber { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsArchived { get; set; }
    
    [NotMapped]
    public List<FileResultDto> Files { get; set; }

    public List<EquipmentActivityDto> EquipmentActivities { get; set; }

    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<Equipment, EquipmentDto>()
            .Map(dest => dest.BranchOfficeName, src => src.CompanyBranch != null ? src.CompanyBranch.BranchOfficeName : "")
            .Map(dest => dest.PurposeOfEquipment, src => src.PurposeOfEquipment != null ? src.PurposeOfEquipment.Name : "")
            .Map(dest => dest.TypeOfCoolingSystem, src => src.TypeOfCoolingSystem != null ? src.TypeOfCoolingSystem.Name : "")
            .Map(dest => dest.TypeOfEquipment, src => src.TypeOfEquipment != null ? src.TypeOfEquipment.Name : "")
            .Map(dest => dest.RefrigerantType, src => src.RefrigerantType != null ? src.RefrigerantType.Name : "")
            .Ignore(r => r.OrdinalNumber)
            .Ignore(r=>r.Files)
            .Ignore(r => r.EquipmentActivities);
    }
}
