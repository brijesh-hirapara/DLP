using DLP.Application.Common.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace DLP.Application.Common.Interfaces;

public interface IJwtAuthManager
{
    Task<JwtAuthResult> GenerateToken(string username, Claim[] claims, DateTime now, bool rememberMe);
    Task<JwtAuthResult> Refresh(string refreshToken, string accessToken, DateTime now, bool rememberMe);
    Task RevokeRefreshToken(string userName);
    (ClaimsPrincipal, JwtSecurityToken) DecodeJwtToken(string token, bool checkValidity = true);
} 