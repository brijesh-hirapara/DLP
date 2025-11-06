using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using System.IdentityModel.Tokens.Jwt;

namespace DLP.Pages;

public class BlacklistMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IMemoryCache _cache;

    public BlacklistMiddleware(RequestDelegate next, IMemoryCache cache)
    {
        _next = next;
        _cache = cache;
    }

    public async Task InvokeAsync(HttpContext httpContext)
    {
        if (httpContext.Request.Headers.TryGetValue("Authorization", out var extractedToken))
        {
            var token = extractedToken.ToString().Substring("Bearer ".Length).Trim();


            string email = GetEmailFromToken(token);
            if (!string.IsNullOrEmpty(email) && _cache.TryGetValue(email, out _))
            {
                httpContext.Response.StatusCode = 401;
                await httpContext.Response.WriteAsync("This email is blacklisted.");
                return;
            }

            if (_cache.TryGetValue(token, out _))
            {
                httpContext.Response.StatusCode = 401;
                await httpContext.Response.WriteAsync("This token is blacklisted.");
                return;
            }
        }

        await _next(httpContext);
    }

    private static string GetEmailFromToken(string token)
    {
        var jwtToken = new JwtSecurityToken(token);
        var emailClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == "email");
        return emailClaim?.Value;
    }
}

