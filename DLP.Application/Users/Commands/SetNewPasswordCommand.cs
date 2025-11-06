using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.Users.Notifications;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using static DLP.Application.Common.Auth.CustomPolicies;

namespace DLP.Application.Users.Commands;

public class SetNewPasswordCommand : IRequest<Unit>
{
    public string UserName { get; set; }
    public string CurrentPassword { get; set; }
    public string Password { get; set; }
    public string ConfirmPassword { get; set; }
}

public class ResetPasswordCommandHandler : IRequestHandler<SetNewPasswordCommand, Unit>
{
    private readonly IActivityLogger _logger;
    private readonly UserManager<User> _userManager;
    private readonly IMediator _mediator;

    public ResetPasswordCommandHandler(IActivityLogger logger, UserManager<User> userManager, IMediator mediator)
    {
        _logger = logger;
        _userManager = userManager;
        _mediator = mediator;
    }

    public async Task<Unit> Handle(SetNewPasswordCommand request, CancellationToken cancellationToken)
    {
        string errorMessagestr = "";
        try
        {
            var user = await _userManager.FindByNameAsync(request.UserName);

            if (user == null)
            {
                errorMessagestr = "Username or password is incorrect!";
               throw new Exception(errorMessagestr);
            }

            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.Password);

            if (!result.Succeeded)
            {
                var errorMessage = result.Errors.Select(x => x.Description).FirstOrDefault();
                if (errorMessage != null)
                {
                     errorMessagestr = errorMessage.ToString();
                    throw new Exception(errorMessagestr);
                    //throw new Exception("Username or password is incorrect!");
                }
            }

            user.MustChangePassword = false;
            user.IsActive = true;
            await _userManager.UpdateAsync(user);

            await _logger.Add(new ActivityLogDto
            {
                UserId = user.Id,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = ActivityType.USER_CHANGED_PASSWORD
            });

            await _mediator.Publish(new ActivateUserNotification(user.Id, user.PasswordHash), cancellationToken);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to reset the user's password");
            throw new Exception(errorMessagestr);
        }
    }
}

