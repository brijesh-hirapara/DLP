
using DLP.Application.Common.Mappings;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.CertifiedTechnicians.DTO;

public class CertifiedTechnicianForUpdateDto : IMapFrom<User>
{
    public string Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PlaceOfBirth { get; set; }
    public string? Address { get; set; }
    public string? Comments { get; set; }
    public string Municipality { get; set; }
    public string Email { get; set; }
    public string PersonalNumber { get; set; }
    public Guid MunicipalityId { get; set; }
    public string Organization { get; set; }
    public Guid? LanguageId { get; set; }


    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<User, CertifiedTechnicianForUpdateDto>()
            .Map(dest => dest.Municipality, src => src.Municipality != null ? src.Municipality.Name : "")
             .Map(dest => dest.Organization, src => src.Organization != null ? src.Organization.Name : "");
    }
}
