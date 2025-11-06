using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.UserGroups.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace DLP.Application.UserGroups.Queries;

public class GetUserGroupDetailsQuery : IRequest<UserGroupDetailsDto>
{
    public string RoleName { get; set; }
}

public class GetUserGroupDetailsQueryHandler : IRequestHandler<GetUserGroupDetailsQuery, UserGroupDetailsDto>
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly IMediator _mediator;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUser;

    public GetUserGroupDetailsQueryHandler(UserManager<User> userManager, RoleManager<Role> roleManager, IMediator mediator, IActivityLogger activityLogger, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _mediator = mediator;
        _activityLogger = activityLogger;
        _currentUser = currentUser;
    }

    public async Task<UserGroupDetailsDto> Handle(GetUserGroupDetailsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var userGroup = await _roleManager.FindByNameAsync(request.RoleName) ?? throw new Exception($"User Group with name {request.RoleName} doesn't exist!");

            var groupUsers = (await _userManager.GetUsersInRoleAsync(request.RoleName))
                .AsQueryable()
                .FilterActiveUsers()
                .Select(x => new GroupUserDto
                {
                    Id = x.Id,
                    FullName = x.FullName
                }).ToList();

            var modulesWithFunctionalities = await _mediator.Send(
                new GetModulesWithFunctionalitiesQuery()
                {
                    UserGroupName = userGroup.Name
                }, cancellationToken);

            var userGroupDetails = new UserGroupDetailsDto
            {
                Name = request.RoleName,
                AccessLevel = userGroup.AccessLevel,
                AccessLevelDesc = userGroup.AccessLevel.GetRawDescription(),
                ModuleFunctionalities = modulesWithFunctionalities,
                Users = groupUsers
            };

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUser.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved user group details"
            });

            return userGroupDetails;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to retrieve user group details", _currentUser.UserId);
            throw;
        }
    }
}

