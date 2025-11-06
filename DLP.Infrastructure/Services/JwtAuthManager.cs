using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Models;
using DLP.Domain.Entities;
using DLP.Infrastructure.Configurations;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Org.BouncyCastle.Asn1.Ocsp;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace DLP.Infrastructure.Services;

public class JwtAuthManager : IJwtAuthManager
{
    private readonly IAppDbContext _context;
    private readonly JwtTokenOptions _jwtTokenOptions;
    private readonly ILogger<JwtAuthManager> _logger;
    private readonly IIdentityService _identityService;
    private readonly UserManager<User> _userManager;
    private readonly byte[] _secret;

    public JwtAuthManager(
        IAppDbContext context,
        JwtTokenOptions jwtTokenOptions,
        ILogger<JwtAuthManager> logger,
        IIdentityService identityService,
        UserManager<User> userManager)
    {
        _context = context;
        _jwtTokenOptions = jwtTokenOptions;
        _logger = logger;
        _secret = Encoding.ASCII.GetBytes(jwtTokenOptions.Secret);
        _identityService = identityService;
        _userManager = userManager;
    }

    public async Task<JwtAuthResult> GenerateToken(string username, Claim[] claims, DateTime now, bool rememberMe)
    {
        var shouldAddAudienceClaim = string.IsNullOrWhiteSpace(claims?.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Aud)?.Value);
        var jwtToken = new JwtSecurityToken(
            _jwtTokenOptions.Issuer,
            shouldAddAudienceClaim ? _jwtTokenOptions.Audience : string.Empty,
            claims,
            expires: now.AddDays(rememberMe
                ? _jwtTokenOptions.RememberMeAccessTokenExpirationInDays
                : _jwtTokenOptions.AccessTokenExpirationInDays),
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(_secret),
                                    SecurityAlgorithms.HmacSha256Signature));

        var accessToken = new JwtSecurityTokenHandler().WriteToken(jwtToken);
        var refreshToken = new RefreshTokenResult
        {
            UserName = username,
            TokenString = GenerateRefreshTokenString(),
            ExpiresAt = now.AddDays(_jwtTokenOptions.RefreshTokenExpirationInDays)
        };

        await RevokeRefreshToken(username);

        // Save new refresh token on database
        _context.RefreshTokens.Add(new RefreshToken
        {
            UserName = refreshToken.UserName,
            Token = refreshToken.TokenString,
            ExpiresAt = refreshToken.ExpiresAt
        });

        await _context.SaveChangesAsync();

        return new JwtAuthResult
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
        };
    }

    public async Task<JwtAuthResult> Refresh(string refreshToken, string accessToken, DateTime now, bool rememberMe)
    {
        var (principal, jwtToken) = DecodeJwtToken(accessToken, false);
        if (jwtToken == null || !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256Signature))
        {
            throw new SecurityTokenException("Invalid token");
        }

        var existingRefreshToken = _context.RefreshTokens.FirstOrDefault(x => x.Token.Equals(refreshToken));

        if (existingRefreshToken == null)
        {
            throw new SecurityTokenException("Invalid token");
        }

        var userName = principal?.Identity?.Name;
        if (existingRefreshToken.UserName != userName || existingRefreshToken.ExpiresAt < now)
        {
            throw new SecurityTokenException("Invalid token");
        }
        var user = await _userManager.FindByEmailAsync(userName);
        var claims = await _identityService.BuildClaimsAsync(user.Id);

        //return await GenerateToken(userName, principal.Claims.ToArray(), now, rememberMe); // need to recover the original claims
        return await GenerateToken(userName, claims, now, rememberMe); // need to recover the original claims
    }

    public (ClaimsPrincipal, JwtSecurityToken) DecodeJwtToken(string accessToken, bool checkValidity = true)
    {
        JwtSecurityToken token;
        ClaimsPrincipal? principal;
        var tokenHandler = new JwtSecurityTokenHandler();
        if (checkValidity)
        {
            CheckTokenValidity(accessToken);
            principal = tokenHandler.ValidateToken(accessToken,
                new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = _jwtTokenOptions.Issuer,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(_secret),
                    ValidAudience = _jwtTokenOptions.Audience,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                },
                out var validatedToken);
            token = validatedToken as JwtSecurityToken;
        }
        else
        {
            token = tokenHandler.ReadJwtToken(accessToken);
            principal = new ClaimsPrincipal(new ClaimsIdentity(token.Claims));
        }


        return (principal, token);
    }

    public async Task RevokeRefreshToken(string userName)
    {
        var refreshTokens = _context.RefreshTokens.Where(x => x.UserName == userName).ToList();
        foreach (var refreshToken in refreshTokens)
        {
            _context.RefreshTokens.Remove(refreshToken);
            await _context.SaveChangesAsync();
        }
    }

    private static string GenerateRefreshTokenString()
    {
        var randomNumber = new byte[32];
        using var randomNumberGenerator = RandomNumberGenerator.Create();
        randomNumberGenerator.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private void CheckTokenValidity(string token)
    {
        try
        {
            if (!string.IsNullOrEmpty(token) && !token.Equals("null"))
            {
                throw new SecurityTokenException("Token is not provided");
            }

            var tokenValidationParamters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _jwtTokenOptions.Issuer,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_jwtTokenOptions.Secret)),
                ValidAudience = _jwtTokenOptions.Audience,
                ValidateAudience = true,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            new JwtSecurityTokenHandler().ValidateToken(token, tokenValidationParamters, out var securityToken);
            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token");
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message, e);
        }
    }
}