using DLP.Application.Common.Mappings;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.Authentication.Profile.DTOs;
public class AccountProfileDto : IMapFrom<User>
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public Language Language { get; set; }
    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<User, AccountProfileDto>();
    }
}