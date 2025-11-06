using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace DLP.Application.Authentication.ForgotPassword;

public class ForgotPasswordCommand : IRequest
{
    public string Email { get; set; }
}

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand>
{
    private readonly UserManager<User> _userManager;
    private readonly IEmailCommunicationService _emailCommunicationService;
    private readonly IActivityLogger _activityLogger;
    public ForgotPasswordCommandHandler(
        UserManager<User> userManager,
        IEmailCommunicationService emailCommunicationService,
        IActivityLogger activityLogger)
    {
        _userManager = userManager;
        _emailCommunicationService = emailCommunicationService;
        _activityLogger = activityLogger;
    }

    public async Task Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email) ?? throw new Exception("User not found");
        await _emailCommunicationService.SendForgotPasswordEmail(user.Email, cancellationToken);
        await _activityLogger.Info($"User ({user.Email}) has request to reset password throught forgot password link");
    }
}