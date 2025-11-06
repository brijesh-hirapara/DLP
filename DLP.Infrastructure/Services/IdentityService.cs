using IdentityModel;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using DLP.Infrastructure.Constants;
using DLP.Infrastructure.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DLP.Application.Common.Constants;
using DLP.Application.ActivityLogs.Dto;
using Microsoft.EntityFrameworkCore;

namespace DLP.Infrastructure.Services;

public class IdentityService : IIdentityService
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly IUserClaimsPrincipalFactory<User> _userClaimsPrincipalFactory;
    private readonly IAppDbContext _dbContext;
    private readonly IAuthorizationService _authorizationService;

    public IdentityService(
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
                IAppDbContext dbContext,
        IUserClaimsPrincipalFactory<User> userClaimsPrincipalFactory,
        IAuthorizationService authorizationService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _dbContext = dbContext;
        _userClaimsPrincipalFactory = userClaimsPrincipalFactory;
        _authorizationService = authorizationService;
    }

    public async Task<User?> GetCurrentUser(string userId, bool includeDependencies = false)
    {
        var user = await _userManager.Users
            .Include(x => x.Organization)
            .Include(x => x.Language)
            .ThenInclude(l => l.I18nCode)
            .FirstOrDefaultAsync(u => u.Id == userId);
        return user;
    }

    public async Task<string?> GetUserNameAsync(string userId)
    {
        var user = await _userManager.Users.FirstAsync(u => u.Id == userId);
        return user?.UserName;
    }

    public async Task<(Result Result, string UserId)> CreateUserAsync(string userName, string password)
    {
        var user = new User
        {
            UserName = userName,
            Email = userName,
        };

        var result = await _userManager.CreateAsync(user, password);

        return (result.ToApplicationResult(), user.Id);
    }

    public async Task<bool> IsInRoleAsync(string userId, string role)
    {
        var user = _userManager.Users.SingleOrDefault(u => u.Id == userId);

        return await _userManager.IsInRoleAsync(user, role);
    }

    public async Task<bool> AuthorizeAsync(string userId, string policyName)
    {
        var user = _userManager.Users.SingleOrDefault(u => u.Id == userId);

        var principal = await _userClaimsPrincipalFactory.CreateAsync(user);

        var result = await _authorizationService.AuthorizeAsync(principal, policyName);

        return result.Succeeded;
    }

    public async Task<Result> DeleteUserAsync(string userId)
    {
        var user = _userManager.Users.SingleOrDefault(u => u.Id == userId);

        if (user != null)
        {
            return await DeleteUserAsync(user);
        }

        return Result.Success();
    }

    public async Task<Result> DeleteUserAsync(User user)
    {
        var result = await _userManager.DeleteAsync(user);

        return result.ToApplicationResult();
    }

    public async Task<Result> UpdateUserAsync(User user)
    {
        var result = await _userManager.UpdateAsync(user);

        return result.ToApplicationResult();
    }

    public async Task<bool> HasClaims(string userId, string[] claims)
    {
        var user = await GetCurrentUser(userId);
        var allClaims = new List<Claim>();
        var roles = await _userManager.GetRolesAsync(user);
        foreach (var role in roles)
        {
            var dbRole = await _roleManager.FindByNameAsync(role);
            var roleClaimList = await _roleManager.GetClaimsAsync(dbRole);
            foreach (var roleClaim in roleClaimList.Select(x => x.Type))
            {
                allClaims.Add(new Claim(CustomClaimType.Permission, roleClaim));
            }
        }
        return allClaims.Any(x => claims.Contains(x.Type));
    }

    public async Task<Claim[]> BuildClaimsAsync1(string userId)
    {
        var user = await GetCurrentUser(userId);
        var roles = await _userManager.GetRolesAsync(user);
        bool isSuperAdministrator = roles.Any(r => r == PredefinedUserGroups.SUPER_ADMINISTRATOR);

        var basicClaims = new[]
        {
        new Claim(ClaimTypes.NameIdentifier, userId),
        new Claim(ClaimTypes.Name, user.Email),
        new Claim(CustomClaimType.FullName, user.FullName),
        new Claim(CustomClaimType.Email, user.Email),
        new Claim(CustomClaimType.Language, $"{user.Language.I18nCode.Code}"),
        new Claim(CustomClaimType.AccessLevel, $"{(int)user.AccessLevel}"),
    };

        var allClaims = await _userManager.GetClaimsAsync(user);
        bool isSingleRole = roles.Count() == 1;
        foreach (var role in roles)
        {
            allClaims.Add(new Claim(JwtClaimTypes.Role, role));

            var dbRole = await _roleManager.FindByNameAsync(role);
            var roleClaimList = await _roleManager.GetClaimsAsync(dbRole);

            foreach (var roleClaim in roleClaimList.Select(x => x.Type))
            {
                // Apply permissions if SuperAdmin or role is predefined
                bool isPredefined = PredefinedUserGroups.IsPredefined(role);

                //if (isSuperAdministrator || (isSingleRole && isPredefined) || (!isSingleRole && !isPredefined))
                //{
                //    allClaims.Add(new Claim(CustomClaimType.Permission, roleClaim));
                //}
                //else
                //{
                //    // Allow basic permissions for non-predefined users
                //    if (roleClaim == "profile:view" || roleClaim == "profile:edit" || roleClaim == "dashboard:view")
                //    {
                //        allClaims.Add(new Claim(CustomClaimType.Permission, roleClaim));
                //    }
                //}
                if (isSuperAdministrator || isPredefined)
                {
                    allClaims.Add(new Claim(CustomClaimType.Permission, roleClaim));
                }
                else if (!isSuperAdministrator && !isPredefined)
                {
                    allClaims.Add(new Claim(CustomClaimType.Permission, roleClaim));
                }
                //else if (isSuperAdministrator || (isSingleRole && isPredefined) || (!isSingleRole && !isPredefined))
                //{
                //    allClaims.Add(new Claim(CustomClaimType.Permission, roleClaim));
                //}
                else
                {
                    // Allow basic permissions for non-predefined users
                    if (roleClaim == "profile:view" || roleClaim == "profile:edit" || roleClaim == "dashboard:view")
                    {
                        allClaims.Add(new Claim(CustomClaimType.Permission, roleClaim));
                    }
                }
            }
        }

        if (user.OrganizationId.HasValue)
        {
            var organization = _dbContext.Organizations.FirstOrDefault(x => x.Id == user.OrganizationId);
            if (organization != null)
            {
                basicClaims = basicClaims.Append(new Claim(CustomClaimType.OrganizationId, $"{user.OrganizationId}")).ToArray();
                basicClaims = basicClaims.Append(new Claim(CustomClaimType.TaxNumber, $"{organization.TaxNumber}")).ToArray();
                basicClaims = basicClaims.Append(new Claim(CustomClaimType.OrganizationName, $"{organization.Name}")).ToArray();

                var userData = await GetCurrentUserByEmail(user.Email);
                var rolesData = await _userManager.GetRolesAsync(userData);

                foreach (var role in rolesData)
                {
                    allClaims.Add(new Claim(CustomClaimType.DashboardPermission, role));
                }
            }
        }

        return allClaims.Concat(basicClaims).ToArray();
    }


    public async Task<Claim[]> BuildClaimsAsync(string userId)
    {
        var user = await GetCurrentUser(userId);
        var roles = await _userManager.GetRolesAsync(user);
        bool isSuperAdministrator = roles.Contains(PredefinedUserGroups.SUPER_ADMINISTRATOR);

        // 1) load the Predefined Super-Admin and its claims once
        var predefinedRole = await _roleManager.FindByNameAsync(PredefinedUserGroups.SUPER_ADMINISTRATOR);
        var predefinedClaimTypes = (await _roleManager.GetClaimsAsync(predefinedRole))
                                      .Select(c => c.Type)
                                      .ToHashSet();
        // 2) find the Company-Super-Admin role for this user's org (if any) and its claims
        var Organization = await _dbContext.Organizations.FirstOrDefaultAsync(x => x.Id == user.OrganizationId);
        HashSet<string> companyAdminClaimTypes = null;
        string companyAdminRoleName = "";
        if (Organization != null)
        {
            //string companyAdminRoleName = $"Company_{user.OrganizationId}_SuperAdmin";
            companyAdminRoleName = $"{Organization.Name} - Super Administrator";
        }
        var companyAdminRole = await _roleManager.FindByNameAsync(companyAdminRoleName);

        if (companyAdminRole != null)
        {
            companyAdminClaimTypes = (await _roleManager.GetClaimsAsync(companyAdminRole))
                                        .Select(c => c.Type)
                                        .ToHashSet();
        }



        // build basic identity/org claims
        var basicClaims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, userId),
        new Claim(ClaimTypes.Name,           user.Email),
        new Claim(CustomClaimType.FullName,  user.FullName),
        new Claim(CustomClaimType.Email,     user.Email),
        new Claim(CustomClaimType.Language,  user.Language.I18nCode.Code),
        new Claim(CustomClaimType.AccessLevel, ((int)user.AccessLevel).ToString())
    };
        if (user.OrganizationId.HasValue)
        {
            var org = await _dbContext.Organizations.FindAsync(user.OrganizationId.Value);
            basicClaims.Add(new Claim(CustomClaimType.OrganizationId, user.OrganizationId.Value.ToString()));
            basicClaims.Add(new Claim(CustomClaimType.TaxNumber, org.TaxNumber));
            basicClaims.Add(new Claim(CustomClaimType.OrganizationName, org.Name));
        }

        // start with any user-specific claims
        var allClaims = new List<Claim>(await _userManager.GetClaimsAsync(user));

        // now loop each role and its permission-claims
        foreach (var roleName in roles)
        {
            allClaims.Add(new Claim(JwtClaimTypes.Role, roleName));

            var dbRole = await _roleManager.FindByNameAsync(roleName);
            var roleClaimList = await _roleManager.GetClaimsAsync(dbRole);

            foreach (var rc in roleClaimList.Select(x => x.Type))
            {
                if (isSuperAdministrator)
                {
                    // MAIN Super-Admin always gets everything
                    allClaims.Add(new Claim(CustomClaimType.Permission, rc));
                }
                else if (roleName == PredefinedUserGroups.SUPER_ADMINISTRATOR)
                {
                    // (unlikely, handled above) but safe: Predefined itself only gets its own claims
                    allClaims.Add(new Claim(CustomClaimType.Permission, rc));
                }
                else if (roleName == companyAdminRoleName)
                {
                    // COMPANY Super-Admin only gets those still in the Predefined
                    if (predefinedClaimTypes.Contains(rc))
                        allClaims.Add(new Claim(CustomClaimType.Permission, rc));
                }
                else
                {
                    // CHILD role only gets those still in the Company Super-Admin
                    if (companyAdminClaimTypes != null
                     && companyAdminClaimTypes.Contains(rc))
                    {
                        allClaims.Add(new Claim(CustomClaimType.Permission, rc));
                    }
                }
            }
        }

        allClaims.AddRange(basicClaims);
        return allClaims.ToArray();
    }

    public async Task<List<string>> GetPermissionsAsync(string userId)
    {
        var claims = await BuildClaimsAsync(userId);
        return claims.Where(x => x.Type == CustomClaimType.Permission).Select(x => x.Value).ToList();
    }
    public async Task<User?> GetCurrentUserByEmail(string email, bool includeDependencies = false)
    {
        var user = await _userManager.Users
            .Include(x => x.Language)
            .ThenInclude(l => l.I18nCode)
            .FirstOrDefaultAsync(u => u.Email == email);
        return user;
    }
    public async Task<List<AccessLevelType>> GetRoleAccessLevelForClaim(string userId, params string[] claimTypes)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null) return new();

        var userRoles = await _userManager.GetRolesAsync(user);

        var rolesWithClaim = await _roleManager.Roles
            .Include(r => r.Claims)
            .Where(r => userRoles.Contains(r.Name!)
                && r.Claims.Any(c => claimTypes.Contains(c.ClaimType) && claimTypes.Contains(c.ClaimValue)))
            .ToListAsync();

        return rolesWithClaim.Select(r => r.AccessLevel).ToList();
    }
}
