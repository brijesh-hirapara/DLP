using DLP.Application.Common.Constants;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Requests.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using System.ComponentModel.DataAnnotations.Schema;

namespace DLP.Application.Organizations.DTOs;

public class OrganizationDto : IMapFrom<Organization>, IOrdinalNumber
{
    public Guid Id { get; set; }
    public string? IdNumber { get; set; }
    public int OrdinalNumber { get; set; }
    public string? Name { get; set; }
    public string? TaxNumber { get; set; }
    public string? ResponsiblePersonFullName { get; set; }
    public string? ResponsiblePersonFunction { get; set; }
    public string? Address { get; set; }
    public string? Place { get; set; }
    public string? PostCode { get; set; }
    public string? Municipality { get; set; }
    public Guid MunicipalityId { get; set; }
    public string? Canton { get; set; }
    public Guid? CantonId { get; set; }
    public string? Entity { get; set; }
    public Guid? EntityId { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? LicenseId { get; set; }
    public Guid? LanguageId { get; set; }
    public DateTime? LicenseDuration { get; set; }
    public DateTime? DateOfRegistration { get; set; }
    public OrganizationTypeEnum? Type { get; set; }
    public string? ContactPersonEmail { get; set; }
    public Guid? BusinessActivityId { get; set; }
    public string? BusinessActivity { get; set; }
    public string? ContactPersonId { get; set; }
    public OrganizationStatus Status { get; set; }
    [NotMapped]
    public string? ContactPersonFirstName { get; set; }
    [NotMapped]
    public string? ContactPersonLastName { get; set; }
    [NotMapped]
    public IList<string> UserGroups { get; set; }
    public IList<UserShortDto>? CompanyAdministrator { get; set; }
    public IList<UserShortDto>? OtherUsers { get; set; }
    public Guid? CountryId { get; set; }
    public ICollection<QuestionnaireDto> Questionnaires { get; set; } = new List<QuestionnaireDto>();

    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<Organization, OrganizationDto>()
           .Map(dest => dest.LanguageId, src => src.CreatedBy != null
                ? src.CreatedBy.LanguageId
                : LanguageConstants.DefaultLanguageId)
           .Map(dest => dest.Municipality, src => src.Municipality != null ? src.Municipality.Name : "")
           .Map(dest => dest.ContactPersonFirstName, src => src.ContactPerson != null ? src.ContactPerson.FirstName : "")
           .Map(dest => dest.ContactPersonLastName, src => src.ContactPerson != null ? src.ContactPerson.LastName : "")
           .Map(dest => dest.ContactPersonEmail, src => src.ContactPerson != null ? src.ContactPerson.Email : "")
           .Map(dest => dest.UserGroups, src => src.ContactPerson != null ? src.ContactPerson.UserRoles.Select(z => z.Role.Name).ToList() : new List<string>())
           .Map(dest => dest.Canton, src => src.Municipality != null && src.Municipality.Canton != null ? src.Municipality.Canton.Name : "")
           .Map(dest => dest.CantonId, src => src.Municipality != null ? src.Municipality.CantonId : null)
           .Map(dest => dest.Entity, src => src.Municipality != null && src.Municipality.StateEntity != null ? src.Municipality.StateEntity.Name : "")
           .Map(dest => dest.CompanyAdministrator, src => src.Employees
                            .Where(x => x.UserRoles != null &&
                                        x.UserRoles.Any(r => r.Role != null &&
                                            (r.Role.NormalizedName == "SHIPPER_COMPANY - SUPER ADMINISTRATOR" ||
                                             r.Role.Name == "CARRIER COMPANY - SUPER ADMINISTRATOR")))
                            .Select(x => new UserShortDto
                            {
                                Id = new Guid(x.Id),
                                FullName = x.FirstName + " " + x.LastName,
                                Email = x.Email,
                                IsActive = x.IsActive
                            }).ToList())
             .Map(dest => dest.OtherUsers, src => src.Employees
                            .Where(x => x.UserRoles == null ||
                                        !x.UserRoles.Any(r => r.Role != null &&
                                            (r.Role.NormalizedName == "SHIPPER_COMPANY - SUPER ADMINISTRATOR" ||
                                             r.Role.Name == "CARRIER COMPANY - SUPER ADMINISTRATOR")))
                            .Select(x => new UserShortDto
                            {
                                Id = new Guid(x.Id),
                                FullName = x.FirstName + " " + x.LastName,
                                Email = x.Email,
                                IsActive = x.IsActive
                            }).ToList())
                                   .Map(dest => dest.EntityId, src => src.StateEntityId)
                                   .Ignore(x => x.BusinessActivity);
                            }


    public class UserShortDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public bool IsActive { get; set; }
    }
}
