using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.CompanyBranches.DTOs;
using DLP.Application.Organizations.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.CompanyBranches.Queries;

public class GetCompanyBranchesQuery : IRequest<OrdinalPaginatedList<CompanyBranchDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string Search { get; set; }
    public Guid? MunicipalityId { get; set; }
    public Guid? EntityId { get; set; }
    public bool IsFromExport { get; set; } = false;
}

public class GetCompanyBranchesQueryHandler : IRequestHandler<GetCompanyBranchesQuery, OrdinalPaginatedList<CompanyBranchDto>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;
    private readonly IActivityLogger _logger;

    public GetCompanyBranchesQueryHandler(IAppDbContext context, ICurrentUserService currentUserService, IIdentityService identityService, IActivityLogger logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
        _logger = logger;
    }

    public async Task<OrdinalPaginatedList<CompanyBranchDto>> Handle(GetCompanyBranchesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var MunicipalityId = request.MunicipalityId;
            var EntityId = request.EntityId;

            var interceptor = await (new GetCompanyBranchesQueryInterceptor(_identityService, _currentUserService)).Get();
            var companyBranchesQuery = _context.CompanyBranches
                .Include(b => b.CreatedBy)
                .Include(b => b.Organization)
                .Where(interceptor)
                .Where(b => !b.IsDeleted)
                .AsQueryable();

            var search = request.Search;
            if (!string.IsNullOrEmpty(search))
            {
                companyBranchesQuery = companyBranchesQuery.Where(b =>
                    b.BranchOfficeName.ToLower().Contains(search.ToLower().Trim()) ||
                    b.Place.ToLower().Contains(search.ToLower().Trim()));
            }

            if (MunicipalityId.HasValue)
            {
                companyBranchesQuery = companyBranchesQuery.Where(x => x.MunicipalityId == MunicipalityId.Value);
            }
            if (EntityId.HasValue)
            {
                companyBranchesQuery = companyBranchesQuery.Where(x => x.Organization.StateEntityId == EntityId.Value);
            }
            OrdinalPaginatedList<CompanyBranchDto> paginatedData;
            if (request.IsFromExport)
            {
                var companyBranchesDtos = companyBranchesQuery.ProjectToType<CompanyBranchDto>().ToList();
                paginatedData = new OrdinalPaginatedList<CompanyBranchDto>(companyBranchesDtos, companyBranchesDtos.Count, request.PageNumber, request.PageSize);
            }
            else
            {
                paginatedData = await companyBranchesQuery
                .ProjectToType<CompanyBranchDto>()
                .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
            }

               

            await _logger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved company branches"
            });

            return paginatedData;
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to retrieve company branches", _currentUserService.UserId);
            throw;
        }
    }
}
