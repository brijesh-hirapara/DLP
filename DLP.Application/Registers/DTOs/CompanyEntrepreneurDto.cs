using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.Registers.DTOs;

public class CompanyEntrepreneurDto : IMapFrom<Organization>, IOrdinalNumber
{
    public Guid Id { get; set; }
    public int OrdinalNumber { get; set; }
    public string CompanyName { get; set; }
    public string Municipality { get; set; }
    public string Entity { get; set; }

    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<Organization, CompanyEntrepreneurDto>()
            .Map(dest => dest.CompanyName, src => src.Name)
            .Map(dest => dest.Municipality, src => src.Municipality.Name)
            .Map(dest => dest.Entity, src => src.Municipality.StateEntity.Name);
    }
}
