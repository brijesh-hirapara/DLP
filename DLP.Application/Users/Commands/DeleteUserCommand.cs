using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Users.Commands;

public class DeleteUserCommand : IRequest<Unit>
{
    public string UserId { get; set; }
    public bool IsHardDelete { get; set; }
}

public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, Unit>
{
    private readonly UserManager<User> _userManager;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUser;
    private readonly IBlacklistService _blacklistService;

    public DeleteUserCommandHandler(UserManager<User> userManager, IActivityLogger activityLogger, ICurrentUserService currentUser, IBlacklistService blacklistService)
    {
        _userManager = userManager;
        _activityLogger = activityLogger;
        _currentUser = currentUser;
        _blacklistService = blacklistService;
    }

    public async Task<Unit> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        try
        {
            if (request.IsHardDelete)
            {
                var user = await _userManager.Users.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == request.UserId);
                await _userManager.DeleteAsync(user);

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"User {user.UserName} has been hard deleted"
                });
            }
            else
            {
                var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == request.UserId);

                if (user == null)
                {
                    await _activityLogger.Exception("User not found for delete!", _currentUser.UserId);
                    throw new NotFoundException("User not found");
                }

                user.MustChangePassword = false;
                user.IsDeleted = true;
                user.IsActive = false;
                await _userManager.UpdateAsync(user);
                var blackListOfUsers = new List<string>();
                blackListOfUsers.Add(user.Email);
                if (blackListOfUsers.Any())
                {
                    _blacklistService.AddToBlacklist(blackListOfUsers.ToArray());
                }

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"User {user.UserName} has been soft deleted"
                });
            }

            return Unit.Value;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to delete user", _currentUser.UserId);
            throw;
        }
    }
}

