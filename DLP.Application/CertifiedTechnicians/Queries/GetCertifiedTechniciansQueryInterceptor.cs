using DLP.Application.Common.Auth;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.QueryInterceptors;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using System.Linq.Expressions;

namespace DLP.Application.CertifiedTechnicians.Queries;

internal class GetCertifiedTechniciansQueryInterceptor
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public GetCertifiedTechniciansQueryInterceptor(IIdentityService identityService, ICurrentUserService currentUserService)
    {
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<Expression<Func<User, bool>>> Get()
    {
        //var accessLevelsForClaim = await _identityService
        //    .GetRoleAccessLevelForClaim(_currentUserService.UserId, CustomPolicies.Registers.ListRegistersOfCertifiedTechnicians.Name);
        var accessLevelsForClaim = new List<AccessLevelType>();
        var authData = _currentUserService.GetDataForInterceptors();

        if (accessLevelsForClaim.IsSuperAdminOrCountry()) return e => true;
        //if (accessLevelsForClaim.Contains(AccessLevelType.Municipality)) return e => e.MunicipalityId == authData.MunicipalityId;
        if (accessLevelsForClaim.Contains(AccessLevelType.Company)) return e => e.OrganizationId == authData.OrganizationId;
        if (accessLevelsForClaim.Contains(AccessLevelType.Basic)) return e => e.CreatedById == _currentUserService.UserId;

        return QueryInterceptors.GenerateEntityAccessLevelsQueryExpression<User>(e => e, accessLevelsForClaim);
    }
}
