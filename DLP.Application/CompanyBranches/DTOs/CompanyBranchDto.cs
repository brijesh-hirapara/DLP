using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.CompanyBranches.DTOs;

public class CompanyBranchDto : IMapFrom<CompanyBranch>, IOrdinalNumber
{
    public Guid Id { get; set; }

    public int OrdinalNumber { get; set; }
    public string BranchOfficeName { get; set; }
    public string IdNumber { get; set; }
    public string Address { get; set; }
    public string Email { get; set; }
    public string ContactPerson { get; set; }
    public string ContactPhone { get; set; }
    public string Place { get; set; }
    public Guid MunicipalityId { get; set; }
    public string Municipality { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedById { get; set; }
    public bool IsDeleted { get; set; }

    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<CompanyBranch, CompanyBranchDto>()
           .Map(dest => dest.CreatedByUser, src => src.CreatedBy.FullName)
           .Map(dest => dest.Municipality, src => src.Municipality.Name);
    }
}
