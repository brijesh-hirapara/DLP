using DLP.Infrastructure.Constants;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;

namespace DLP.Infrastructure.Middlewares;

public class ApiKeyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string _apiKey;

    public ApiKeyMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _apiKey = configuration["AppSettings:ApiKey"];
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Headers.TryGetValue("ApiKey", out var apiKeyHeader) &&
            context.Request.Headers.TryGetValue("Authorization-Permission", out var permissionHeader))
        {
            var apiKey = apiKeyHeader.ToString().Trim();
            var permission = permissionHeader.ToString().Trim();

            if (apiKey == _apiKey)
            {
                var claims = new[]
                {
                    new Claim(CustomClaimType.Permission, permission),
                };
                var identity = new ClaimsIdentity(claims, "ApiKey");
                var principal = new ClaimsPrincipal(identity);

                context.User = principal;
            }
        }

        await _next(context);
    }
}

