using DLP.Application.Common.Auth;
using DLP.Infrastructure.Constants;
using Microsoft.AspNetCore.Authorization;

namespace DLP.Infrastructure.Extensions;

public static class AuthorizationOptionsExtensions
{
    public static void AddCustomPolicies(this AuthorizationOptions options)
    {
        foreach (var policy in CustomPolicies.GetAllPolicies().SelectMany(x => x.Functionalities))
        {
            options.AddPolicy(policy.Name!, p => p.RequireClaim(CustomClaimType.Permission, policy.Name!));
        }
    }
}