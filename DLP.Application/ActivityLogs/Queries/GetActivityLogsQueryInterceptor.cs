using DLP.Application.Common.Auth;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.QueryInterceptors;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using System.Linq.Expressions;

namespace DLP.Application.ActivityLogs.Queries;

internal class GetActivityLogsQueryInterceptor
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public GetActivityLogsQueryInterceptor(IIdentityService identityService, ICurrentUserService currentUserService)
    {
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<Expression<Func<ActivityLog, bool>>> Get()
    {
        var accessLevelsForClaim = await _identityService
            .GetRoleAccessLevelForClaim(_currentUserService.UserId, CustomPolicies.Logs.List.Name);
        var authData = _currentUserService.GetDataForInterceptors();

        if (accessLevelsForClaim.IsSuperAdminOrCountry()) return e => true;
        //if (accessLevelsForClaim.Contains(AccessLevelType.Municipality)) return e => e.User.MunicipalityId == authData.MunicipalityId;
        if (accessLevelsForClaim.Contains(AccessLevelType.Company)) return e => e.User.OrganizationId == authData.OrganizationId;
        if (accessLevelsForClaim.Contains(AccessLevelType.Basic)) return e => e.UserId == _currentUserService.UserId;

        return QueryInterceptors.GenerateEntityAccessLevelsQueryExpression<ActivityLog>(e => e.User, accessLevelsForClaim);
    }
}
