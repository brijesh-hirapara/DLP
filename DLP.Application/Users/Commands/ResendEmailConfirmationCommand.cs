using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Security;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace DLP.Application.Users.Commands;

public class ResendEmailConfirmationCommand : IRequest
{
    public string Id { get; set; }
}

public class ResendEmailConfirmationCommandHandler : IRequestHandler<ResendEmailConfirmationCommand>
{
    private readonly UserManager<User> _userManager;
    private readonly IEmailCommunicationService _emailCommunicationService;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUser;

    public ResendEmailConfirmationCommandHandler(UserManager<User> userManager, IEmailCommunicationService emailCommunicationService, IActivityLogger activityLogger, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _emailCommunicationService = emailCommunicationService;
        _activityLogger = activityLogger;
        _currentUser = currentUser;
    }

    public async Task Handle(ResendEmailConfirmationCommand request, CancellationToken cancellationToken)
    {
        string errorMessage = string.Empty;
        try
        {
            errorMessage = "User not found";
            var user = await _userManager.FindByIdAsync(request.Id) ?? throw new Exception(errorMessage);

            var oneTimePassword = PasswordUtils.GenerateOTP();
            await _userManager.RemovePasswordAsync(user);
            await _userManager.AddPasswordAsync(user, oneTimePassword);
            await _emailCommunicationService.SendOneTimePasswordEmail(user.Email!, oneTimePassword, cancellationToken);

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUser.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = $"Resent email confirmation for user {user.UserName}"
            });
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to resend email confirmation", _currentUser.UserId);
            throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
        }
    }
}


