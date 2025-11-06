using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.RefrigerantTypes.DTO;

public class RefrigerantTypeDto : IMapFrom<RefrigerantType>, IOrdinalNumber
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string? ASHRAEDesignation { get; set; }
    public string? TypeOfCoolingFluid { get; set; }
    public string? GlobalWarmingPotential { get; set; }
    public string? ChemicalFormula { get; set; }
    public int OrdinalNumber { get; set; }

    // If you wish to include a list of Equipment DTOs in the RefrigerantTypeDto, 
    // you would need to create an EquipmentDto and reference it here.
    // public List<EquipmentDto> Equipments { get; set; }


    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<RefrigerantType, RefrigerantTypeDto>();
    }
}
