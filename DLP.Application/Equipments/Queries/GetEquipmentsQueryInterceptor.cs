using DLP.Application.Common.Auth;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.QueryInterceptors;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using System.Linq.Expressions;

namespace DLP.Application.Equipments.Queries;

internal class GetEquipmentsQueryInterceptor
{

    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public GetEquipmentsQueryInterceptor(IIdentityService identityService, ICurrentUserService currentUserService)
    {
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<Expression<Func<Equipment, bool>>> Get()
    {
        //var accessLevelsForClaim = await _identityService
        //    .GetRoleAccessLevelForClaim(_currentUserService.UserId, CustomPolicies.Equipments.List.Name);
        var accessLevelsForClaim = new List<AccessLevelType>();
        var authData = _currentUserService.GetDataForInterceptors();

        if (accessLevelsForClaim.IsSuperAdminOrCountry()) return e => true;
        //if (accessLevelsForClaim.Contains(AccessLevelType.Municipality)) return e => e.CompanyBranch.MunicipalityId == authData.MunicipalityId;
        if (accessLevelsForClaim.Contains(AccessLevelType.Company)) return e => e.CompanyBranch.OrganizationId == authData.OrganizationId;
        if (accessLevelsForClaim.Contains(AccessLevelType.Basic)) return e => e.CreatedById == _currentUserService.UserId;

        return QueryInterceptors.GenerateEntityAccessLevelsQueryExpression<Equipment>(e => e.CompanyBranch.Organization!, accessLevelsForClaim);
    }
}

