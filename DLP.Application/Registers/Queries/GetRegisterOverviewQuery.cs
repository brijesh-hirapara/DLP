using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Pagination;
using DLP.Application.Registers.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Registers.Queries;

public class GetRegisterOverviewQuery : IRequest<RegisterOverviewDto>
{
    public Guid? EntityId { get; set; }
}

public class GetRegisterOverviewQueryHandler : IRequestHandler<GetRegisterOverviewQuery, RegisterOverviewDto>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _logger;
    private readonly ICurrentUserService _currentUser;
    private readonly IIdentityService _identityService;

    public GetRegisterOverviewQueryHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUser, IIdentityService identityService)
    {
        _context = context;
        _logger = logger;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<RegisterOverviewDto> Handle(GetRegisterOverviewQuery request, CancellationToken cancellationToken)
    {
        try
        {
            int ownerOperatorOrganizations;
            int kghServiceCompanyOrganizations;
            int importexportOrganizations;
            int certifiedTechnicies;

            if (request.EntityId == null || request.EntityId == Guid.Empty)
            {
                 ownerOperatorOrganizations = _context.Organizations
               .Include(i => i.Branches)
               .Include(i => i.Municipality)
                 .ThenInclude(i => i.StateEntity)
               .Include(i => i.CompanyRegisterTypes)
               .Where(x => !x.IsDeleted &&
                   (x.Type != OrganizationTypeEnum.INSTITUTION) &&
                   x.CompanyRegisterTypes.Any(t => t.Type == CompanyType.OwnerAndOperator))
               .Count();

                 kghServiceCompanyOrganizations = _context.Organizations
               .Include(i => i.Municipality)
                  .ThenInclude(i => i.StateEntity)
               .Include(i => i.Employees)
               .Include(i => i.CompanyRegisterTypes)
               .Include(i => i.BusinessActivity)
               .Where(x => !x.IsDeleted &&
                   (x.Type != OrganizationTypeEnum.INSTITUTION) &&
                   x.CompanyRegisterTypes.Any(t => t.Type == CompanyType.ServiceCompanyEnterpreneur))
           .Count();

                 importexportOrganizations = _context.Organizations
                .Include(i => i.Municipality)
                  .ThenInclude(i => i.StateEntity)
                .Include(i => i.CompanyRegisterTypes)
                .Include(i => i.BusinessActivity)
                .Where(x => !x.IsDeleted && x.CompanyRegisterTypes.Any(t => t.Type == CompanyType.ImporterExporter))
                 .Count();

                certifiedTechnicies = _context.Users
                .IgnoreQueryFilters()
                .Include(x => x.Municipality)
                .Include(x => x.Organization)
                .Include(x => x.CreatedBy)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(x => x.Qualifications)
                    .ThenInclude(x => x.QualificationType)
                     .Where(x => x.IsCertifiedTechnician)
                .Where(IsNotSystemUser()) // it shouldn't happen due to IsCertifiedTechnician but JIC!
                 .Count();

                RegisterOverviewDto registerOverviewDto = new RegisterOverviewDto
                {
                    TotalImportsCompanies = importexportOrganizations,
                    TotalKghEquiementCompanies = ownerOperatorOrganizations,
                    TotalServiceCompanies = kghServiceCompanyOrganizations,
                    CertifiedTechnicies = certifiedTechnicies
                };

                return registerOverviewDto;
            }

             ownerOperatorOrganizations = _context.Organizations
                .Include(i => i.Branches)
                .Include(i => i.Municipality)
                  .ThenInclude(i => i.StateEntity)
                .Include(i => i.CompanyRegisterTypes)
                .Where(x => !x.IsDeleted && x.Municipality.StateEntityId == request.EntityId &&
                    (x.Type != OrganizationTypeEnum.INSTITUTION))
                    //&& x.CompanyRegisterTypes.Any(t => t.Type == CompanyType.OwnerAndOperator))
                .Count();

             kghServiceCompanyOrganizations = _context.Organizations
                .Include(i => i.Municipality)
                   .ThenInclude(i => i.StateEntity)
                .Include(i => i.Employees)
                .Include(i => i.CompanyRegisterTypes)
                .Include(i => i.BusinessActivity)
                .Where(x => !x.IsDeleted &&  x.Municipality.StateEntityId == request.EntityId &&
                    (x.Type != OrganizationTypeEnum.INSTITUTION)) 
                //&& x.CompanyRegisterTypes.Any(t => t.Type == CompanyType.ServiceCompanyEnterpreneur))
            .Count();

             importexportOrganizations = _context.Organizations
                .Include(i => i.Municipality)
                  .ThenInclude(i => i.StateEntity)
                .Include(i => i.CompanyRegisterTypes)
                .Include(i => i.BusinessActivity)
                .Where(x => !x.IsDeleted && x.Municipality.StateEntityId == request.EntityId && x.CompanyRegisterTypes.Any(t => t.Type == CompanyType.ImporterExporter))
                 .Count();

             certifiedTechnicies =_context.Users
                .IgnoreQueryFilters()
                .Include(x => x.Municipality)
                .Include(x => x.Organization)
                .Include(x => x.CreatedBy)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(x => x.Qualifications)
                    .ThenInclude(x => x.QualificationType)
                     .Where(x => x.IsCertifiedTechnician && x.Municipality.StateEntityId == request.EntityId)
                .Where(IsNotSystemUser()) // it shouldn't happen due to IsCertifiedTechnician but JIC!
                 .Count();

            var stateEntity = await _context.StateEntities
        .Include(se => se.Cantons)
        .Include(se => se.Municipalities)
        .FirstOrDefaultAsync(se => se.Id == request.EntityId, cancellationToken);


            RegisterOverviewDto registerOverview = new RegisterOverviewDto
            {
                EntityName = stateEntity.Name,
                TotalImportsCompanies = importexportOrganizations,
                TotalKghEquiementCompanies = ownerOperatorOrganizations,
                TotalServiceCompanies = kghServiceCompanyOrganizations,
                CertifiedTechnicies = certifiedTechnicies
            };

            return registerOverview;
        }
        catch (Exception)
        {

            throw;
        }
    }

    public static Expression<Func<User, bool>> IsNotSystemUser()
    {
        return u => u.Id != SystemConstants.SystemUserId;
    }
}


