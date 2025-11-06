

using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Models;
using DLP.Domain.Enums;
using DLP.Infrastructure.Constants;
using System.Security.Claims;

namespace DLP.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string UserId => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
    public string UserName => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name);
    public string UserRole => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
    public List<string> UserRoleList =>
     _httpContextAccessor.HttpContext?.User?
         .FindAll(ClaimTypes.Role)
         .Select(c => c.Value)
         .ToList() ?? new List<string>();
    public Guid? OrganizationId
    {
        get
        {
            var organizationIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(CustomClaimType.OrganizationId);
            if (organizationIdClaim != null && Guid.TryParse(organizationIdClaim, out var organizationId))
            {
                return organizationId;
            }
            return null;
        }
    }

    public Guid MunicipalityId
    {
        get
        {
            var municipalityIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(CustomClaimType.Municipality);
            if (municipalityIdClaim != null && Guid.TryParse(municipalityIdClaim, out var municipalityId))
            {
                return municipalityId;
            }
            return default;
        }
    }

    public string LanguageCode => _httpContextAccessor.HttpContext?.User?.FindFirstValue(CustomClaimType.Language);

    public AccessLevelType AccessLevel
    {
        get
        {
            var accessLevelClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(CustomClaimType.AccessLevel);
            if (accessLevelClaim != null && Enum.TryParse(accessLevelClaim, out AccessLevelType accessLevel))
            {
                return accessLevel;
            }
            return AccessLevelType.Basic;
        }
    }


    public AuthDataForQueryInterceptor GetDataForInterceptors()
    {
        return new(OrganizationId, MunicipalityId, AccessLevel);
    }
}