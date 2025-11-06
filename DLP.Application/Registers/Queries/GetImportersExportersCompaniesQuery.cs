using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Application.Registers.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using DLP.Application.Common.Auth;
using DLP.Application.Requests.DTOs;

namespace DLP.Application.Registers.Queries;

public class GetImportersExportersCompaniesQuery : IOrderingQuery<Organization>, IRequest<OrdinalPaginatedList<ImporterExporterCompanyDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string Search { get; set; }
    public Guid? MunicipalityId { get; set; }
    public OrganizationTypeEnum? Type { get; set; }
    public bool SkipAccessCheck { get; set; }
    public Guid? EntityId { get; set; }

    public bool IsFromExport { get; set; } = false;


    // Sorting

    private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

    private static readonly IReadOnlyDictionary<string, Expression<Func<Organization, object?>>> OrderingPropertyMappings =
        new Dictionary<string, Expression<Func<Organization, object?>>>(StringComparer)
        {
            { "idNumber", x => x.IdNumber},
            { "companyName", x => x.Name },
            { "municipality", x => x.Municipality.Name },
            { "companyType", x => x.Type },
            { "licenseId", x => x.LicenseId },
            { "licenseDuration", x => x.LicenseDuration },
        };

    private static readonly OrderByFunction<Organization> DefaultOrdering = new(x => x.CreatedAt, true);

    private static IReadOnlySet<string>? PropertyKeys { get; set; }

    //Sorting

    public SortingBy? Sorting { get; set; }
    public OrderByFunction<Organization> GetDefaultOrdering() => DefaultOrdering;
    public IReadOnlyDictionary<string, Expression<Func<Organization, object?>>> GetOrderingPropertyMappings() => OrderingPropertyMappings;
    public IReadOnlySet<string> GetPropertyKeys()
    {
        PropertyKeys ??= OrderingPropertyMappings.Keys.ToHashSet(StringComparer);
        return PropertyKeys;
    }
    // end Sorting
}

public class GetImportersExportersCompaniesQueryHandler : IRequestHandler<GetImportersExportersCompaniesQuery, OrdinalPaginatedList<ImporterExporterCompanyDto>>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _logger;
    private readonly ICurrentUserService _currentUser;
    private readonly IIdentityService _identityService;

    public GetImportersExportersCompaniesQueryHandler(IAppDbContext context, IActivityLogger logger, IIdentityService identityService, ICurrentUserService currentUser)
    {
        _context = context;
        _logger = logger;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<OrdinalPaginatedList<ImporterExporterCompanyDto>> Handle(GetImportersExportersCompaniesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var search = request.Search;
            //var interceptor = !request.SkipAccessCheck
            //    ? await (new GetRegistersQueryInterceptor(_identityService, _currentUser))
            //        .Get(CustomPolicies.Registers.List.Name, CustomPolicies.Registers.ListRegistersOfImporters.Name)
            //    : x => true;
            Expression<Func<Organization, bool>> interceptor = x => true;
            var organizations = _context.Organizations
                .Include(i => i.Municipality)
                .Include(i => i.CompanyRegisterTypes)
                .Include(i => i.BusinessActivity)
                .Where(interceptor)
                .Where(x => !x.IsDeleted && x.CompanyRegisterTypes.Any(t => t.Type == CompanyType.ImporterExporter))
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                organizations = organizations.Where(m =>
                    (string.IsNullOrEmpty(search)
                    || m.Name.ToLower().Trim().Contains(search.ToLower().Trim())
                    || m.Municipality.Name.ToLower().Trim().Contains(search.ToLower().Trim())));
            }

            if (request.MunicipalityId.HasValue)
            {
                organizations = organizations.Where(x => x.MunicipalityId == request.MunicipalityId.Value);
            }

            if (request.EntityId.HasValue)
            {
                organizations = organizations.Where(x => x.Municipality.StateEntityId == request.EntityId.Value);
            }

            if (request.Type.HasValue)
            {
                organizations = organizations.Where(x => x.Type == request.Type.Value);
            }

            OrdinalPaginatedList<ImporterExporterCompanyDto> responseData;

            if (request.IsFromExport)
            {
                var response =  organizations
                    .ApplyOrderByFunctions(request.GetOrderByFunction())
                    .ProjectToType<ImporterExporterCompanyDto>().ToList();
                responseData = new OrdinalPaginatedList<ImporterExporterCompanyDto>(response, response.Count, request.PageNumber, request.PageSize);

            }
            else
            {
                responseData = await organizations
                .ApplyOrderByFunctions(request.GetOrderByFunction())
                .ProjectToType<ImporterExporterCompanyDto>()
                .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
            }
            

            await _logger.Add(new ActivityLogDto
            {
                UserId = _currentUser.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved Importers/Exporters Companies"
            });

            return responseData;
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to retrieve Importers/Exporters Companies", _currentUser.UserId);
            throw;
        }
    }
}


