
using DLP.Application.CertifiedTechnicians.DTOs;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using Mapster;
using System.ComponentModel.DataAnnotations.Schema;

namespace DLP.Application.CertifiedTechnicians.DTO;

public class CertifiedTechnicianDto : IMapFrom<User>, IOrdinalNumber
{
    public int OrdinalNumber { get; set; }
    public string Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? PlaceOfBirth { get; set; }
    public string RoleName { get; set; }
    public string? Address { get; set; }
    public bool IsDeleted { get; set; }
    public bool IsActive { get; set; }
    public bool IsPending { get; set; }
    public bool IsCertifiedTechnician { get; set; }
    public string Email { get; set; }
    public string PersonalNumber { get; set; }
    public Guid? MunicipalityId { get; set; }
    public string Municipality { get; set; }
    public Guid? OrganizationId { get; set; }
    public string TrainingCenter { get; set; }
    public string CurrentQualification { get; set; }
    public string CertificateNumber { get; set; }
    public Guid? LanguageId { get; set; }
    public bool IsCreatedByMyGroup { get; set; }
    [NotMapped]
    public IList<string> UserGroups { get; set; }

    [NotMapped]
    public List<QualificationDto> Qualifications { get; set; }
    [NotMapped]
    public List<EmploymentHistoryDto> EmploymentHistory { get; set; }

    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<User, CertifiedTechnicianDto>()
            .Map(dest => dest.Municipality, src => src.Municipality != null ? src.Municipality.Name : "")
            .Map(dest => dest.TrainingCenter, src => src.Organization != null ? src.Organization.Name : "")
            .Map(dest => dest.CurrentQualification, src => src.Qualifications != null ? src.Qualifications.LastOrDefault().QualificationType.Name : "")
            .Ignore(r => r.OrdinalNumber)
            .Ignore(r => r.Qualifications)
            .Ignore(r => r.UserGroups);
    }
}
