using DLP.Application.Common.Auth;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.QueryInterceptors;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using LinqKit;
using System.Linq.Expressions;

namespace DLP.Application.Requests.Queries;

internal class GetRequestsQueryInterceptor
{

    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public GetRequestsQueryInterceptor(IIdentityService identityService, ICurrentUserService currentUserService)
    {
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<Expression<Func<Request, bool>>> Get()
    {
        var accessLevelsForClaim = await _identityService
            .GetRoleAccessLevelForClaim(_currentUserService.UserId, CustomPolicies.Requests.List.Name, CustomPolicies.Requests.ListArchived.Name);
        var authData = _currentUserService.GetDataForInterceptors();

        if (accessLevelsForClaim.IsSuperAdminOrCountry()) return e => true;
        //if (accessLevelsForClaim.Contains(AccessLevelType.Municipality)) return e => e.MunicipalityId == authData.MunicipalityId;
        if (accessLevelsForClaim.Contains(AccessLevelType.Company)) return e => e.CompanyId == authData.OrganizationId;
        if (accessLevelsForClaim.Contains(AccessLevelType.Basic)) return e => e.CreatedById == _currentUserService.UserId;

        return QueryInterceptors.GenerateEntityAccessLevelsQueryExpression<Request>(e => e.Company!, accessLevelsForClaim);
    }
}
