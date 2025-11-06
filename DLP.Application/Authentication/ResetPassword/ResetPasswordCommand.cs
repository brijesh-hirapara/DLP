using DLP.Application.Users.Notifications;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Application.Authentication.ResetPassword;

public class ResetPasswordCommand : IRequest<ActionResult<string>>
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string Code { get; set; }
}

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, ActionResult<string>>
{
    private readonly IMediator _mediator;
    private readonly UserManager<User> _userManager;
    public ResetPasswordCommandHandler(UserManager<User> userManager, IMediator mediator)
    {
        _userManager = userManager;
        _mediator = mediator;
    }

    public async Task<ActionResult<string>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return "Email address does not exist in the system.";



        user.MustChangePassword = false;
        var result = await _userManager.ResetPasswordAsync(user, request.Code, request.Password);

        if (!result.Succeeded)
        {
            return "Something went wrong while reseting your password";
        }
        return "Password changed successfully.";

        //await _mediator.Publish(new ActivateUserNotification(user.Id, user.PasswordHash), cancellationToken);
    }
}