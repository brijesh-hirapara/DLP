using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace DLP.Application.Authentication.Login;
public class LoginCommand : IRequest<LoginResponse>
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public bool RememberMe { get; set; }

}

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly IJwtAuthManager _jwtAuthManager;
    private readonly IIdentityService _identityService;
    private readonly IActivityLogger _activityLogger;
    private readonly UserManager<User> _userManager;
    private readonly IBlacklistService _blacklistService;
    private readonly IConfiguration _configuration;

    public LoginCommandHandler(
        UserManager<User> userManager,
        IJwtAuthManager jwtAuthManager,
        IIdentityService identityService,
        IActivityLogger activityLogger,
        IBlacklistService blacklistService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _jwtAuthManager = jwtAuthManager;
        _identityService = identityService;
        _activityLogger = activityLogger;
        _blacklistService = blacklistService;
        _configuration = configuration;
    }

    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email) ?? throw new Exception("Email or password incorrect");

        var validCredentials = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!validCredentials || user.IsDeleted)
        {
            throw new Exception("Email or password incorrect");
        }

        if (!user.IsActive && !user.MustChangePassword)
        {
            throw new Exception("Email or password incorrect");
        }

        var claims = await _identityService.BuildClaimsAsync(user.Id);
        var jwtResult = await _jwtAuthManager.GenerateToken(request.Email, claims, DateTime.Now, request.RememberMe);
        await _activityLogger.Info($"User [{request.Email}] logged in the system.");
        _blacklistService.RemoveFromBlacklist(request.Email);
        var APIsiteUrl =  _configuration["APIUrl"];

        return new LoginResponse
        {
            UserName = request.Email,
            AccessToken = jwtResult.AccessToken,
            ShouldShowOnboarding = user.MustChangePassword,
            RememberMe = request.RememberMe,
            ProfileImage = $"{APIsiteUrl}/ProfileImages/{user.ProfileImage}"
        };
    }
}