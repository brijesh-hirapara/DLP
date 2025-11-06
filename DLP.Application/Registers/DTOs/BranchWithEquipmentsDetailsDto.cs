using DLP.Application.Common.Mappings;
using DLP.Application.Equipments.DTOs;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.Registers.DTOs;

public class BranchWithEquipmentsDetailsDto : IMapFrom<CompanyBranch>
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string Address { get; set; }
    public string Place { get; set; }
    public string ContactPerson { get; set; }
    public string ContactPhone { get; set; }
    public string Municipality { get; set; }
    public string Canton { get; set; }
    public string Entity { get; set; }
    public int EquipmentsCount { get; set; }
    public List<EquipmentDto> Equipments { get; set; }
    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<CompanyBranch, BranchWithEquipmentsDetailsDto>()
            .Map(dest => dest.Name, src => src.BranchOfficeName)
            .Map(dest => dest.Email, src => src.Email)
            .Map(dest => dest.Address, src => src.Address)
            .Map(dest => dest.Place, src => src.Place)
            .Map(dest => dest.ContactPerson, src => src.ContactPerson)
            .Map(dest => dest.ContactPhone, src => src.ContactPhone)
            .Map(dest => dest.Municipality, src => src.Municipality != null ? src.Municipality.Name : "")
            .Map(dest => dest.Canton, src => src.Municipality != null && src.Municipality.Canton != null ? src.Municipality.Canton.Name : "")
            .Map(dest => dest.Entity, src => src.Municipality != null && src.Municipality.StateEntity != null ? src.Municipality.StateEntity.Name : "");
    }
}
