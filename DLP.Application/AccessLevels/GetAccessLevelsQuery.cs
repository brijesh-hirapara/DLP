using DLP.Domain.Enums;
using MediatR;
using System.ComponentModel;

namespace DLP.Application.AccessLevels;

public class GetAccessLevelsQuery : IRequest<List<AccessLevelDto>>
{
    public AccessLevelType CurrentUserAccessLevel { get; set; }
}

public class GetAccessLevelsQueryHandler : IRequestHandler<GetAccessLevelsQuery, List<AccessLevelDto>>
{
    public GetAccessLevelsQueryHandler() { }

    public async Task<List<AccessLevelDto>> Handle(GetAccessLevelsQuery request, CancellationToken cancellationToken)
    {
        var accessLevels = GetAccessLevels(request.CurrentUserAccessLevel);
        var accessLevelsResponse = accessLevels
               .Select(al => new AccessLevelDto
               {
                   Id = (int)al,
                   Name = GetAccessLevelName(al)
               })
               .OrderByDescending(x => x.Id)
               .ToList();

        return accessLevelsResponse;
    }

    private static readonly Dictionary<AccessLevelType, List<AccessLevelType>> AccessLevelMappings = new()
    {
        { AccessLevelType.SuperAdministrator, Enum.GetValues(typeof(AccessLevelType)).Cast<AccessLevelType>().ToList() },
        //{ AccessLevelType.CountryOfBiH, new List<AccessLevelType> { AccessLevelType.CountryOfBiH, AccessLevelType.EntityFBih, AccessLevelType.EntitySprska, AccessLevelType.EntityBrcko } },
        //{ AccessLevelType.EntityFBih, new List<AccessLevelType> { AccessLevelType.EntityFBih, AccessLevelType.Municipality } },
        //{ AccessLevelType.EntitySprska, new List<AccessLevelType> { AccessLevelType.EntitySprska, AccessLevelType.Municipality } },
        //{ AccessLevelType.EntityBrcko, new List<AccessLevelType> { AccessLevelType.EntityBrcko, AccessLevelType.Municipality } },
        { AccessLevelType.Company, new List<AccessLevelType> { AccessLevelType.Company, AccessLevelType.Basic } }
    };

    private static IEnumerable<AccessLevelType> GetAccessLevels(AccessLevelType currentUserAccessLevel)
    {
        return AccessLevelMappings.TryGetValue(currentUserAccessLevel, out var levels) ? levels : Array.Empty<AccessLevelType>();
    }

    private static string GetAccessLevelName(AccessLevelType accessLevel)
    {
        var descriptionAttribute = accessLevel!.GetType()!
            .GetField(accessLevel!.ToString()!)
            .GetCustomAttributes(typeof(DescriptionAttribute), false)
            .FirstOrDefault() as DescriptionAttribute;

        return descriptionAttribute?.Description ?? accessLevel.ToString();
    }
}
