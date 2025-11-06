
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.UserGroups.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace DLP.Application.UserGroups.Commands;

public class UserGroupPermission
{
    public string Name { get; set; }
    public bool Checked { get; set; }
}

public class AddUserGroupCommand : IRequest<Unit>
{
    public required string Name { get; set; }
    public AccessLevelType? AccessLevel { get; set; }
    public string? CreatedById { get; set; }
    public List<AssignUserToGroupDto> Users { get; set; }
    public List<UserGroupPermission> Permissions { get; set; }
}

public class AddUserGroupCommandHandler : IRequestHandler<AddUserGroupCommand, Unit>
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly ICurrentUserService _currentUserService;
    private readonly IBlacklistService _blacklistService;
    private readonly IActivityLogger _activityLogger;

    public AddUserGroupCommandHandler(
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
        ICurrentUserService currentUserService,
        IBlacklistService blacklistService,
        IActivityLogger activityLogger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _currentUserService = currentUserService;
        _blacklistService = blacklistService;
        _activityLogger = activityLogger;
    }

    public async Task<Unit> Handle(AddUserGroupCommand request, CancellationToken cancellationToken)
    {
        var userId = request.CreatedById ?? _currentUserService.UserId;
        try
        {
            var newRole = new Role
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                NormalizedName = request.Name.ToUpper(),
                AccessLevel = request.AccessLevel.Value,
                ConcurrencyStamp = Guid.NewGuid().ToString(),
                CreatedById = userId,
                CreatedAt = DateTime.UtcNow,
            };

            var identityRoleResult = await _roleManager.CreateAsync(newRole);
            if (!identityRoleResult.Succeeded)
            {
                var errorMessages = identityRoleResult.Errors.Select(x => x.Description);
                await _activityLogger.Error($"Failed to add user group {request.Name}", _currentUserService.UserId);
                throw new Exception($"User Group creation failed. {string.Join(",", errorMessages)}");
            }

            var claimsToAdd = request.Permissions
                .Where(x => x.Checked)
                .Select(f => new Claim(f.Name, f.Name))
                .ToList();
            foreach (var claim in claimsToAdd)
            {
                await _roleManager.AddClaimAsync(newRole, claim);
            }

            var blackListOfUsers = new List<string>();
            foreach (var user in request.Users)
            {
                var identityUser = await _userManager.FindByIdAsync(user.Id);
                if (request.AccessLevel > identityUser.AccessLevel)
                {
                    identityUser.AccessLevel = request.AccessLevel.Value;
                    await _userManager.UpdateAsync(identityUser);
                }
                await _userManager.AddToRoleAsync(identityUser, request.Name);
                blackListOfUsers.Add(identityUser.Email);
            }

            _blacklistService.AddToBlacklist(blackListOfUsers.ToArray());

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = $"User Group {request.Name} added successfully"
            });

            return Unit.Value;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, $"Failed to add user group {request.Name}", _currentUserService.UserId);
            throw;
        }
    }
}
