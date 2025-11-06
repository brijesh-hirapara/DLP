using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Auth;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.UserGroups.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
namespace DLP.Application.UserGroups.Queries;

public class GetModulesWithFunctionalitiesQuery : IRequest<List<ModuleFunctionalitiesDto>>
{
    public string UserGroupName { get; set; }
}

public class GetModulesWithFunctionalitiesQueryHandler : IRequestHandler<GetModulesWithFunctionalitiesQuery, List<ModuleFunctionalitiesDto>>
{
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;
    private readonly RoleManager<Role> _roleManager;
    private readonly IActivityLogger _activityLogger;

    public GetModulesWithFunctionalitiesQueryHandler(IIdentityService identityService, ICurrentUserService currentUserService, RoleManager<Role> roleManager, IActivityLogger activityLogger)
    {
        _roleManager = roleManager;
        _identityService = identityService;
        _currentUserService = currentUserService;
        _activityLogger = activityLogger;
    }

    public async Task<List<ModuleFunctionalitiesDto>> Handle(GetModulesWithFunctionalitiesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            Role? userGroup = null;
            if (!string.IsNullOrEmpty(request.UserGroupName))
            {
                userGroup = await _roleManager.FindByNameAsync(request.UserGroupName!);
            }

            var userGroupPermissions = userGroup != null
                ? (await _roleManager.GetClaimsAsync(userGroup)).Select(x => x.Type)
                : new List<string>();
            var claimsOfCurrentUser = await _identityService.GetPermissionsAsync(_currentUserService.UserId);

            var modulesWithFunctionalities = CustomPolicies.GetAllPolicies();
            var modules = modulesWithFunctionalities
                 .Select(module => new
                 {
                     module.Id,
                     Name = module.ModuleName,
                     Functionalities = _currentUserService.UserRole == PredefinedUserGroups.SUPER_ADMINISTRATOR
                        ? module.Functionalities
                        : module.Functionalities.Where(f => claimsOfCurrentUser.Contains(f.Name))
                 });

            var modulesDto = modules
                .Where(x => x.Functionalities.Any())
                .Select(m => new ModuleFunctionalitiesDto
                {
                    Id = m.Id,
                    Name = m.Name,
                    Checked = m.Functionalities.Any() && m.Functionalities.All(x => userGroupPermissions.Contains(x.Name)),
                    Functionalities = m.Functionalities.Select(x => new FunctionalityDto
                    {
                        Name = x.Name,
                        Description = x.Description,
                        Checked = userGroupPermissions.Contains(x.Name)
                    }).ToList()
                })
                .ToList();

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved modules with functionalities"
            });

            return modulesDto;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to retrieve modules with functionalities", _currentUserService.UserId);
            throw;
        }
    }
}


