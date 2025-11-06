using DLP.Application.Common.Auth;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.QueryInterceptors;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using System.Linq.Expressions;
using DLP.Application.Common.Constants;
using LinqKit;

namespace DLP.Application.Registers.Queries;

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
        if (accessLevelsForClaim.Contains(AccessLevelType.Basic)) return e => e.CreatedById == _currentUserService.UserId;

        var accessLevelsPredicate = PredicateBuilder.New<Equipment>(false);

        foreach (var accessLevel in accessLevelsForClaim)
        {
            Expression<Func<Equipment, bool>> accessLevelCondition = null;

            //switch (accessLevel)
            //{
            //    case AccessLevelType.EntityFBih:
            //        accessLevelCondition = e => e.CompanyBranch.Organization.StateEntityId == EntityConstants.FBiH;
            //        break;
            //    case AccessLevelType.EntitySprska:
            //        accessLevelCondition = e => e.CompanyBranch.Organization.StateEntityId == EntityConstants.Srpska;
            //        break;
            //    case AccessLevelType.EntityBrcko:
            //        accessLevelCondition = e => e.CompanyBranch.Organization.StateEntityId == EntityConstants.Brcko;
            //        break;
            //}

            accessLevelsPredicate = accessLevelsPredicate.Or(accessLevelCondition);
        }

        return accessLevelsPredicate;
    }
}
