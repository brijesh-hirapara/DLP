using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Auth;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.UserGroups.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace DLP.Application.UserGroups.Queries;

public class GetUserGroupsQuery : IRequest<List<GroupOverviewDto>>
{
    public string? Search { get; set; }
}

public class GetUserGroupsQueryHandler : IRequestHandler<GetUserGroupsQuery, List<GroupOverviewDto>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly IActivityLogger _activityLogger;

    public GetUserGroupsQueryHandler(ICurrentUserService currentUserService, UserManager<User> userManager, RoleManager<Role> roleManager, IActivityLogger activityLogger)
    {
        _currentUserService = currentUserService;
        _userManager = userManager;
        _roleManager = roleManager;
        _activityLogger = activityLogger;
    }

    public async Task<List<GroupOverviewDto>> Handle(GetUserGroupsQuery request, CancellationToken cancellationToken)
    {
        try
        {

            IQueryable<Role> rolesQuery = _roleManager.Roles.Where(x => !x.IsDeleted); // Exclude deleted roles

            // If the user is NOT a Super Administrator, filter by CreatedById
            if (!_currentUserService.UserRoleList.Contains("Super Administrator"))
            {
                rolesQuery = rolesQuery.Where(x => x.CreatedById == _currentUserService.UserId);
            }
            var groups = await rolesQuery.ToListAsync(cancellationToken);

            if (!string.IsNullOrEmpty(request.Search))
            {
                string search = request.Search;
                groups = groups.Where(x => x.Name.IndexOf(search, StringComparison.OrdinalIgnoreCase) >= 0).ToList();
            }

            var groupOverviewList = new List<GroupOverviewDto>();

            var x = await _roleManager.Roles.ToListAsync(cancellationToken);

            foreach (var group in groups)
            {
                var groupName = group.Name;
                var usersInGroup = (await _userManager.GetUsersInRoleAsync(group.Name!)).AsQueryable().FilterActiveUsers();
                var userGroupPermissions = (await _roleManager.GetClaimsAsync(group)).Select(x => x.Type);
                var currentPermissions = CustomPolicies.GetAllPolicies().SelectMany(x => x.Functionalities).Where(x => userGroupPermissions.Contains(x.Name)).Count();

                groupOverviewList.Add(new GroupOverviewDto
                {
                    Id = group.Id,
                    Name = groupName!,
                    TotalMembers = usersInGroup.Count(),
                    TotalActiveMembers = usersInGroup.Where(x => x.IsActive).Count(),
                    TotalPermissions = currentPermissions,
                    IsEditable = !PredefinedUserGroups.IsPredefined(groupName!) && !_currentUserService.UserRoleList.Contains(groupName!)
                });
            }

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved user groups"
            });

            return groupOverviewList.OrderBy(x => x.Name).ToList();
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to retrieve user groups", _currentUserService.UserId);
            throw;
        }
    }

    private static Expression<Func<Role, bool>> GetInterceptor(AccessLevelType? providedAccessLevel, Guid? myOrganizationId)
    {
        return providedAccessLevel == AccessLevelType.SuperAdministrator ?
               e => true :
               e => e.CreatedBy.OrganizationId == myOrganizationId;
    }
}
