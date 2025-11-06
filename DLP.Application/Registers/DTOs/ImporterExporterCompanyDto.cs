using DLP.Application.Common.Extensions;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.Registers.DTOs;
public class ImporterExporterCompanyDto : IMapFrom<Organization>, IOrdinalNumber
{
    public Guid Id { get; set; }
    public int OrdinalNumber { get; set; }
    public string CompanyName { get; set; }
    public string Municipality { get; set; }
    public string CompanyType { get; set; }
    public string LicenseId { get; set; }
    public DateTime? LicenseDuration { get; set; }

    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<Organization, ImporterExporterCompanyDto>()
           .Map(dest => dest.CompanyName, src => src.Name)
           .Map(dest => dest.Municipality, src => src.Municipality.Name)
           .Map(dest => dest.CompanyType, src => src.Type.GetRawDescription())
           .Map(dest => dest.LicenseId, src => src.LicenseId)
           .Map(dest => dest.LicenseDuration, src => src.LicenseDuration);
    }
}
