using DLP.Application.Common.Interfaces;
using MediatR;

namespace DLP.Application.Authentication.Logout;

public class LogoutCommand : IRequest
{
    public string AccessToken { get; set; }
}

public class LogoutCommandHandler : IRequestHandler<LogoutCommand>
{
    private readonly IJwtAuthManager _jwtAuthManager;
    private readonly IActivityLogger _activityLogger;
    public LogoutCommandHandler(IJwtAuthManager jwtAuthManager, IActivityLogger activityLogger)
    {
        _jwtAuthManager = jwtAuthManager;
        _activityLogger = activityLogger;
    }

    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var (principal, _) = _jwtAuthManager.DecodeJwtToken(request.AccessToken);
        var userName = principal.Identity.Name;
        await _jwtAuthManager.RevokeRefreshToken(userName);
        await _activityLogger.Info($"User [{userName}] logged out the system.");
    }
}