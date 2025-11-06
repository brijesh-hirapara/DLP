using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.Registers.DTOs;

public class MarkedEquipmentDto : IMapFrom<Equipment>, IOrdinalNumber
{
    public Guid Id { get; set; }
    public int OrdinalNumber { get; set; }
    public string EquipmentIdNumber { get; set; }
    public string TypeOfEquipment { get; set; }
    public string OwnerCompany { get; set; }
    public string Municipality { get; set; }

    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<Equipment, MarkedEquipmentDto>()
           .Map(dest => dest.EquipmentIdNumber, src => src.SerialNumber)
           .Map(dest => dest.TypeOfEquipment, src => src.TypeOfEquipment != null ? src.TypeOfEquipment.Name : src.TypeOfEquipmentOther)
           .Map(dest => dest.OwnerCompany, src => src.CompanyBranch.Organization.Name)
           .Map(dest => dest.Municipality, src => src.CompanyBranch.Municipality.Name);
    }
}
