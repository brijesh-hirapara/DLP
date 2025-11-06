using Duende.IdentityServer.Models;
using Duende.IdentityServer.Services;
using IdentityModel;
using DLP.Domain.Entities;
using DLP.Infrastructure.Constants;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;

namespace DLP.Infrastructure.Services;
public class IdentityProfileService : IProfileService
{
    protected readonly UserManager<User> _userManager;
    protected readonly RoleManager<Role> _roleManager;
    private readonly IConfiguration _configuration;
    public IdentityProfileService(
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
    }

    public async Task GetProfileDataAsync(ProfileDataRequestContext context)
    {
        //Acces token lifetime - 8 hours
        context.Client.AccessTokenLifetime = _configuration.GetValue<int>("AccessTokenLifetime");
        var user = await _userManager.GetUserAsync(context.Subject);
        var allClaims = await _userManager.GetClaimsAsync(user);
        var roles = await _userManager.GetRolesAsync(user);
        foreach (var role in roles)
        {
            allClaims.Add(new Claim(JwtClaimTypes.Role, role));
            var dbRole = await _roleManager.FindByNameAsync(role);
            var roleClaimList = await _roleManager.GetClaimsAsync(dbRole);
            foreach (var roleClaim in roleClaimList.Select(x => x.Type))
            {
                allClaims.Add(new Claim(CustomClaimType.Permission, roleClaim));
            }
        }

        allClaims.Add(new Claim(CustomClaimType.FullName, user.FullName));
        allClaims.Add(new Claim(CustomClaimType.Email, user.Email));
        allClaims.Add(new Claim(CustomClaimType.Language, $"{user.Language.I18nCode.Code}"));
        allClaims.Add(new Claim(CustomClaimType.AccessLevel, $"{(int)user.AccessLevel}"));

        if (user.OrganizationId.HasValue)
        {
            allClaims.Add(new Claim(CustomClaimType.OrganizationId, $"{user.OrganizationId}"));
        }
        context.IssuedClaims.AddRange(allClaims);
    }

    public Task IsActiveAsync(IsActiveContext context)
    {
        return Task.CompletedTask;
    }
}
