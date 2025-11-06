using DLP.Domain.Common;
using DLP.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace DLP.Domain.Entities;

public class User : IdentityUser, IAuditableEntity, IHasStateEntityId
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime? BirthDay { get; set; }
    public string? PlaceOfBirth { get; set; }
    public bool IsDeleted { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedById { get; set; }
    public User CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedById { get; set; }
    public string? PersonalNumber { get; set; }
    public bool MustChangePassword { get; set; }
    public Guid? MunicipalityId { get; set; }
    public virtual Municipality Municipality {get;set;}
    public Guid StateEntityId { get; set; }
    public AccessLevelType AccessLevel { get; set; }
    public string? Address { get; set; }
    public string? Comments { get; set; }

    public Guid? OrganizationId { get; set; }
    public virtual Organization? Organization { get; set; }
    public bool IsCertifiedTechnician { get; set; }

    public Guid? LanguageId { get; set; }
    public virtual Language? Language { get; set; }
    public virtual List<UserRole> UserRoles { get; set; }
    public virtual List<Qualification> Qualifications { get; set; } = new List<Qualification>(); // applied only to CertifiedTechnicians
    public virtual List<Employment> EmploymentHistory { get; set; } = new List<Employment>(); // applied only to CertifiedTechnicians

    [NotMapped]
    public string FullName => FirstName + " " + LastName;
    public string? ProfileImage { get; set; }
    public string? BannerImage { get; set; }
    public string? PhoneNumber { get; set; }

    public void CleanIncludes()
    {
        Language = null;
        CreatedBy = null;
        Municipality = null;
        Organization = null;
        UserRoles = UserRoles.Select(x => new UserRole { UserId = x.UserId, RoleId = x.RoleId }).ToList();
    }
}
