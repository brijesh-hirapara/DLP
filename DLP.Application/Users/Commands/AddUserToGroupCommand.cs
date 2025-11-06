using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace DLP.Application.Users.Commands
{
    public class AddUserToGroupCommand : IRequest<Unit>
    {
        public string UserId { get; set; }
        public string RoleName { get; set; }
    }

    public class AddUserToGroupCommandCommandHandler : IRequestHandler<AddUserToGroupCommand, Unit>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;

        public AddUserToGroupCommandCommandHandler(UserManager<User> userManager, RoleManager<Role> roleManager, IActivityLogger activityLogger, ICurrentUserService currentUser)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _activityLogger = activityLogger;
            _currentUser = currentUser;
        }

        public async Task<Unit> Handle(AddUserToGroupCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var roleExists = await _roleManager.RoleExistsAsync(request.RoleName);
                if (!roleExists)
                {
                    throw new Exception($"User Group with name {request.RoleName} doesn't exist!");
                }

                var user = await _userManager.FindByIdAsync(request.UserId);
                var identityResult = await _userManager.AddToRoleAsync(user, request.RoleName);
                if (!identityResult.Succeeded)
                {
                    var errorMessages = identityResult.Errors.Select(x => x.Description);
                    await _activityLogger.Error($"Adding user to {request.RoleName} failed. {string.Join(",", errorMessages)}", _currentUser.UserId);
                    throw new Exception($"Adding user to {request.RoleName} failed. {string.Join(",", errorMessages)}");
                }

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"User added to group {request.RoleName} successfully"
                });

                return Unit.Value;
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Failed to add user to group", _currentUser.UserId);
                throw;
            }
        }
    }

}
