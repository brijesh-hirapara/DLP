
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using Mapster;
using System.ComponentModel.DataAnnotations.Schema;

namespace DLP.Application.Users.DTO;

public class UserDto : IMapFrom<User>, IOrdinalNumber
{
    public int OrdinalNumber { get; set; }
    public string Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? PlaceOfBirth { get; set; }
    public bool IsDeleted { get; set; }
    public bool IsActive { get; set; }
    public bool IsPending { get; set; }
    public string PersonalNumber { get; set; }
    public string PhoneNumber { get; set; }

    public string RoleName { get; set; }
    public string Email { get; set; }
    public Guid? MunicipalityId { get; set; }
    public Guid? CantonId { get; set; }
    public Guid StateEntityId { get; set; }
    public Guid? OrganizationId { get; set; }
    public string? OrganizationName { get; set; }
    public Guid? LanguageId { get; set; }
    public string Comments { get; set; }
    public bool IsAdmin { get; set; }
    public string? ProfileImage { get; set; }
    public string? BannerImage { get; set; }

    [NotMapped]
    public IList<string> UserGroups { get; set; }

    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<User, UserDto>()
            .Ignore(r => r.RoleName)
            .Ignore(r => r.OrdinalNumber)
            .Ignore(r => r.UserGroups);
    }
}
