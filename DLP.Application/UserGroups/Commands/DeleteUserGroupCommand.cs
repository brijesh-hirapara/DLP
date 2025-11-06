using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace DLP.Application.UserGroups.Commands
{
    public class DeleteUserGroupCommand : IRequest<Unit>
    {
        public string Name { get; set; }
    }

    public class DeleteUserGroupCommandHandler : IRequestHandler<DeleteUserGroupCommand, Unit>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly IBlacklistService _blacklistService;
        private readonly IActivityLogger _activityLogger;

        private readonly ICurrentUserService _currentUserService;


        public DeleteUserGroupCommandHandler(UserManager<User> userManager, RoleManager<Role> roleManager, IBlacklistService blacklistService, IActivityLogger activityLogger, ICurrentUserService currentUserService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _blacklistService = blacklistService;
            _activityLogger = activityLogger;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(DeleteUserGroupCommand request, CancellationToken cancellationToken)
        {
            var userGroupName = request.Name;
            try
            {
                var isPreDefined = PredefinedUserGroups.IsPredefined(userGroupName);
                if (isPreDefined)
                {
                    throw new Exception($"{userGroupName} is an internal User Group and cannot be deleted!");
                }

                var userGroup = await _roleManager.FindByNameAsync(userGroupName) ?? throw new Exception($"User Group with name {request.Name} doesn't exist!");
                var userGroupUsers = (await _userManager.GetUsersInRoleAsync(userGroupName)).AsQueryable().FilterActiveUsers();
                _blacklistService.AddToBlacklist(userGroupUsers.Select(x => x.Email).ToArray());
                await _roleManager.DeleteAsync(userGroup);

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"User Group {userGroupName} deleted successfully"
                });

                return Unit.Value;
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, $"Failed to delete user group {userGroupName}", _currentUserService.UserId);
                throw;
            }
        }
    }

}