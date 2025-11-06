using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Security;
using DLP.Application.Users.Commands;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Users.Commands
{
    public class NotConfirmUsersEmailCommand : IRequest
    {
       
    }


    public class NotConfirmUsersEmailCommandandler : IRequestHandler<NotConfirmUsersEmailCommand>
{
    private readonly UserManager<User> _userManager;
    private readonly IEmailCommunicationService _emailCommunicationService;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUser;

    public NotConfirmUsersEmailCommandandler(UserManager<User> userManager, IEmailCommunicationService emailCommunicationService, IActivityLogger activityLogger, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _emailCommunicationService = emailCommunicationService;
        _activityLogger = activityLogger;
        _currentUser = currentUser;
    }

    public async Task Handle(NotConfirmUsersEmailCommand request, CancellationToken cancellationToken)
    {
            try
            {
                // Get all users from the database
                var users = _userManager.Users.Where(u => u.MustChangePassword && !u.IsActive).ToList();
                bool allEmailsSentSuccessfully = true;

                // Send email to each user
                foreach (var user in users)
                {
                    try
                    {
                        var oneTimePassword = PasswordUtils.GenerateOTP();
                        await _userManager.RemovePasswordAsync(user);
                        await _userManager.AddPasswordAsync(user, oneTimePassword);
                        await _emailCommunicationService.SendNotConfirmedUserEmail(user.Email!, oneTimePassword, cancellationToken);

                        // Log the activity for each user
                        await _activityLogger.Add(new ActivityLogDto
                        {
                            UserId = _currentUser.UserId,
                            LogTypeId = (int)LogTypeEnum.INFO,
                            Activity = $"Resent email confirmation for user {user.UserName}"
                        });
                    }
                    catch (Exception ex)
                    {
                        allEmailsSentSuccessfully = false;
                        await _activityLogger.Exception(ex.Message, $"Failed to resend email confirmation for user {user.UserName}", _currentUser.UserId);
                    }
                }

                // Log the final status of email sending
                if (allEmailsSentSuccessfully)
                {
                    await _activityLogger.Add(new ActivityLogDto
                    {
                        UserId = _currentUser.UserId,
                        LogTypeId = (int)LogTypeEnum.INFO,
                        Activity = "All user emails sent successfully"
                    });
                }
                else
                {
                    await _activityLogger.Add(new ActivityLogDto
                    {
                        UserId = _currentUser.UserId,
                        LogTypeId = (int)LogTypeEnum.ERROR,
                        Activity = "Some user emails failed to send"
                    });
                }
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Failed to resend email confirmation to users", _currentUser.UserId);
                throw new Exception(ex.Message);
            }
        }

      
    }

}
