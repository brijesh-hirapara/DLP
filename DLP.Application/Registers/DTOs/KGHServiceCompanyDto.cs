using DLP.Application.Common.Extensions;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.Registers.DTOs;

public class KGHServiceCompanyDto : IMapFrom<Organization>, IOrdinalNumber
{
    public Guid Id { get; set; }
    public int OrdinalNumber { get; set; }
    public string CompanyName { get; set; }
    public string LicenseId { get; set; }
    public DateTime LicenseDuration { get; set; }
    public string Municipality { get; set; }
    public string CompanyType { get; set; }
    public string StatusDesc { get; set; }
    public int NrOfCertifiedServiceTechnicians { get; set; }

    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<Organization, KGHServiceCompanyDto>()
           .Map(dest => dest.CompanyName, src => src.Name)
           .Map(dest => dest.Municipality, src => src.Municipality.Name)
           .Map(dest => dest.StatusDesc, src => src.Status.GetRawDescription())
           .Map(dest => dest.CompanyType, src => src.Type.GetRawDescription())
           .Map(dest => dest.NrOfCertifiedServiceTechnicians, src => src.Employees.Count(x => !x.IsDeleted && x.IsCertifiedTechnician));
    }
}
