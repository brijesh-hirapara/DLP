using DLP.Application.Authentication.Login;
using DLP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace DLP.Application.Authentication.RefreshToken;

public class RefreshTokenCommand : IRequest<LoginResponse>
{
    public string AccessToken { get; set; }
    public bool RememberMe { get; set; }
}

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, LoginResponse>
{
    private readonly IAppDbContext _context;
    private readonly IJwtAuthManager _jwtAuthManager;
    private readonly ILogger<RefreshTokenCommandHandler> _logger;
    private readonly IBlacklistService _blacklistService;

    public RefreshTokenCommandHandler(
        IAppDbContext context,
        IJwtAuthManager jwtAuthManager,
        ILogger<RefreshTokenCommandHandler> logger,
        IBlacklistService blacklistService)
    {
        _context = context;
        _jwtAuthManager = jwtAuthManager;
        _logger = logger;
        _blacklistService = blacklistService;
    }

    public async Task<LoginResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var accessToken = request.AccessToken;
        var (principal, _) = _jwtAuthManager.DecodeJwtToken(accessToken, false);
        var userName = principal.Identity.Name;

        var refreshToken = await _context.RefreshTokens.FirstOrDefaultAsync(x => x.UserName == userName, cancellationToken: cancellationToken)
            ?? throw new Exception($"There's no active refresh token for give usern {userName})");
        var jwtResult = await _jwtAuthManager.Refresh(refreshToken.Token, accessToken, DateTime.Now, request.RememberMe);
        _blacklistService.RemoveFromBlacklist(userName);
        _logger.LogInformation($"User [{userName}] has refreshed JWT token.");

        return new LoginResponse
        {
            UserName = userName,
            Role = principal.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Role)?.Value ?? string.Empty,
            AccessToken = jwtResult.AccessToken,
            RememberMe = request.RememberMe,
        };
    }
}
