using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.Registers.DTOs;

public class OwnerOperatorOfEquipmentDto : IMapFrom<Organization>, IOrdinalNumber
{
    public Guid Id { get; set; }
    public int OrdinalNumber { get; set; }
    public string CompanyName { get; set; }
    public string Municipality { get; set; }
    public int NrOfBranches { get; set; }
    public int NrOfEquipments { get; set; }

    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<Organization, OwnerOperatorOfEquipmentDto>()
           .Map(dest => dest.CompanyName, src => src.Name)
           .Map(dest => dest.Municipality, src => src.Municipality.Name)
           .Map(dest => dest.NrOfBranches, src => src.Branches.Count(x => !x.IsDeleted))
           .Map(dest => dest.NrOfEquipments, src => src.Branches
                .Where(x => !x.IsDeleted)
                .SelectMany(x => x.Equipments)
                .Count(x => !x.IsDeleted));
    }
}
