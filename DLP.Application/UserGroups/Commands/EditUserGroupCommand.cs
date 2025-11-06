using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.UserGroups.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using DocumentFormat.OpenXml.InkML;
using System.Linq;

namespace DLP.Application.UserGroups.Commands;

public class EditUserGroupCommand : IRequest<GroupOverviewDto>
{
    public string Name { get; set; }
    public string NewName { get; set; }
    public AccessLevelType AccessLevel { get; set; }
    public List<AssignUserToGroupDto> Users { get; set; }
    public List<UserGroupPermission> Permissions { get; set; }
}

public class EditUserGroupCommandHandler : IRequestHandler<EditUserGroupCommand, GroupOverviewDto>
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly IBlacklistService _blacklistService;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAppDbContext _context;

    public EditUserGroupCommandHandler(IAppDbContext context, UserManager<User> userManager, RoleManager<Role> roleManager, IBlacklistService blacklistService, IActivityLogger activityLogger, ICurrentUserService currentUserService)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _blacklistService = blacklistService;
        _activityLogger = activityLogger;
        _currentUserService = currentUserService;
    }

    public async Task<GroupOverviewDto> Handle(EditUserGroupCommand request, CancellationToken cancellationToken)
    {
        var userGroupName = request.Name;
        //try
        //{
            var userGroup = await _roleManager.FindByNameAsync(request.Name) ?? throw new Exception($"User Group with name {request.Name} doesn't exist!");
            var userGroupPermissions = await _roleManager.GetClaimsAsync(userGroup);
            var userGroupUsers = (await _userManager.GetUsersInRoleAsync(userGroupName)).AsQueryable().FilterActiveUsers();

            // Permissions part
            var currentPermissions = userGroupPermissions.Select(p => p.Value).ToHashSet();
            var requestedPermissions = request.Permissions.Select(p => p.Name).ToHashSet();

            var permissionsToAdd = requestedPermissions.Except(currentPermissions);
            var permissionsToRemove = currentPermissions.Except(requestedPermissions);

            foreach (var permission in permissionsToRemove)
            {
                await _roleManager.RemoveClaimAsync(userGroup, new Claim(permission, permission));
            }

            foreach (var permission in permissionsToAdd)
            {
                await _roleManager.AddClaimAsync(userGroup, new Claim(permission, permission));
            }
        var currentUserId = _currentUserService.UserId;
        var currentUserRole = _currentUserService.UserRole;


        // Step 1: Find roles where CreatedById = current user's ID
        var userGroupsList = (await _userManager.GetUsersInRoleAsync(request.Name))
         .AsQueryable()
           .FilterActiveUsers()
         .Select(x => new GroupUserDto
         {
             Id = x.Id,
             FullName = x.FullName
         })
         .SelectMany(ct => _context.Roles.Where(ug => ug.CreatedById == ct.Id))
       .ToList();


        var groupUsers = (await _userManager.GetUsersInRoleAsync(request.Name))
            .AsQueryable()
            .FilterActiveUsers()
             .SelectMany(ct => _context.Roles.Where(ug => ug.CreatedById == ct.Id))
             .Where(x => x.Name.Contains("Super Administrator"))
            .Select(x => x.Name)
            .ToList();
        // Step 2: Find the role in userGroupsList that matches the current user's role
        var currentUserGroup = userGroupsList.FirstOrDefault(ug => ug.Name == currentUserRole);

        if (currentUserGroup == null)
        {
            // If currentUserRole is not found, add roles where the current user is associated
            var associatedGroupIds = _context.UserRoles
                .Where(ur => ur.UserId == currentUserId)
                .Select(ur => ur.RoleId)
                .ToList();

            var associatedGroups = _context.Roles
                .Where(r => associatedGroupIds.Contains(r.Id))
                .ToList();

            // Add associated groups to userGroupsList
            userGroupsList.AddRange(associatedGroups);
        }







        if (userGroupsList != null)
        {
            foreach (var usersgroupListData in userGroupsList)
            {
                var userGroupM = await _roleManager.FindByNameAsync(usersgroupListData.Name)
                    ?? throw new Exception($"User Group with name {usersgroupListData.Name} doesn't exist!");

                var userupdateGroupPermissions = await _roleManager.GetClaimsAsync(userGroupM);
                var usersupdateInGroup = (await _userManager.GetUsersInRoleAsync(userGroupName)).AsQueryable().FilterActiveUsers();

                var currentupdatePermissions = userGroupPermissions.Select(p => p.Value).ToHashSet();
                var requestedupdatePermissions = request.Permissions.Select(p => p.Name).ToHashSet();

                var permissionsupdateToAdd = requestedPermissions.Except(currentPermissions);
                var permissionsupdateToRemove = currentPermissions.Except(requestedPermissions);

                foreach (var permission in permissionsupdateToRemove)
                {
                    await _roleManager.RemoveClaimAsync(userGroupM, new Claim(permission, permission));


                }
                foreach (var permission in permissionsupdateToAdd)
                {

                    if (groupUsers.Contains(usersgroupListData.Name))
                    {
                        await _roleManager.AddClaimAsync(userGroupM, new Claim(permission, permission));
                    }
                }

                var currentupdateUserIds = usersupdateInGroup.Select(u => u.Id).ToHashSet();
                var requestedupdateUserIds = request.Users.Select(u => u.Id).ToHashSet();

                var usersupadteToAdd = requestedupdateUserIds.Except(currentupdateUserIds).ToList();
                var usersupdateToRemove = currentupdateUserIds.Except(requestedupdateUserIds).ToList();

                var blackLisupdatetOfUsers = new List<string>();
                foreach (var userId in usersupdateToRemove)
                {
                    var user = usersupdateInGroup.First(x => x.Id == userId);
                    blackLisupdatetOfUsers.Add(user.Email);
                    await _userManager.RemoveFromRoleAsync(user, userGroupName);
                }

                foreach (var userId in usersupadteToAdd)
                {
                    var user = await _userManager.FindByIdAsync(userId);
                    blackLisupdatetOfUsers.Add(user.Email);
                    await _userManager.AddToRoleAsync(user, userGroupName);
                }

                if (permissionsToRemove.Any() || permissionsToAdd.Any())
                {
                    blackLisupdatetOfUsers.AddRange(usersupdateInGroup.Select(x => x.Email).ToArray());
                }

                if (blackLisupdatetOfUsers.Any())
                {
                    _blacklistService.AddToBlacklist(blackLisupdatetOfUsers.ToArray());
                }
                await _roleManager.UpdateAsync(userGroupM);

            }
        }
        // Users part
        var currentUserIds = userGroupUsers.Select(u => u.Id).ToHashSet();
            var requestedUserIds = request.Users.Select(u => u.Id).ToHashSet();

            var usersToAdd = requestedUserIds?.Except(currentUserIds)?.ToList() ?? new();
            var usersToRemove = currentUserIds?.Except(requestedUserIds)?.ToList() ?? new();

            var blackListOfUsers = new List<string>();
            foreach (var userId in usersToRemove)
            {
                var user = userGroupUsers.First(x => x.Id == userId);
                blackListOfUsers.Add(user.Email);
                await _userManager.RemoveFromRoleAsync(user, userGroupName);
            }

            foreach (var userId in usersToAdd)
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user != null)
                {
                    blackListOfUsers.Add(user.Email);
                    await _userManager.AddToRoleAsync(user, userGroupName);
                }
                else
                {
                    throw new Exception($"User is not available with {userId}");
                }
            }

            if (permissionsToRemove.Any() || permissionsToAdd.Any() || userGroup.AccessLevel != request.AccessLevel)
            {
                blackListOfUsers.AddRange(userGroupUsers.Select(x => x.Email).ToArray());
            }

            if (blackListOfUsers.Any())
            {
                _blacklistService.AddToBlacklist(blackListOfUsers.ToArray());
            }

            if (request.Name != request.NewName || userGroup.AccessLevel != request.AccessLevel)
            {
                userGroup.AccessLevel = request.AccessLevel;
                userGroup.Name = request.NewName ?? request.Name;
                await _roleManager.UpdateAsync(userGroup);
            }

            var usersInGroup = (await _userManager.GetUsersInRoleAsync(userGroup.Name)).AsQueryable().FilterActiveUsers();

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = $"User group {request.Name} edited successfully"
            });

            return new GroupOverviewDto
            {
                Id = userGroup.Id,
                IsEditable = !PredefinedUserGroups.IsPredefined(userGroup.Name!),
                Name = userGroup.Name,
                TotalMembers = request.Users.Count,
                TotalActiveMembers = usersInGroup.Where(x => x.IsActive).Count(),
                TotalPermissions = request.Permissions.Count
            };
        //}
        //catch (Exception ex)
        //{
        //    await _activityLogger.Exception(ex.Message, $"Failed to edit user group {request.Name}", _currentUserService.UserId);
        //    throw;
        //}
    }
}

