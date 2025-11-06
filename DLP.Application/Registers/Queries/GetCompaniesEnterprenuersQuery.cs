using System.Linq.Expressions;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Auth;
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

namespace DLP.Application.Registers.Queries;

public class GetCompaniesEnterprenuersQuery : IOrderingQuery<Organization>, IRequest<OrdinalPaginatedList<CompanyEntrepreneurDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string Search { get; set; }
    public Guid? MunicipalityId { get; set; }
    public Guid? EntityId { get; set; }
    public bool SkipAccessCheck { get; set; }

    // Sorting

    private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

    private static readonly IReadOnlyDictionary<string, Expression<Func<Organization, object?>>> OrderingPropertyMappings =
        new Dictionary<string, Expression<Func<Organization, object?>>>(StringComparer)
        {
            { "idNumber", x => x.IdNumber},
            { "companyName", x => x.Name },
            { "municipality", x => x.Municipality.Name },
            { "entity", x => x.Municipality.StateEntity.Name },
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
    
public class GetCompaniesEnterprenuersQueryHandler : IRequestHandler<GetCompaniesEnterprenuersQuery, OrdinalPaginatedList<CompanyEntrepreneurDto>>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _logger;
    private readonly ICurrentUserService _currentUser;
    private readonly IIdentityService _identityService;

    public GetCompaniesEnterprenuersQueryHandler(IAppDbContext context, IActivityLogger logger, IIdentityService identityService, ICurrentUserService currentUser)
    {
        _context = context;
        _logger = logger;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<OrdinalPaginatedList<CompanyEntrepreneurDto>> Handle(GetCompaniesEnterprenuersQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var search = request.Search;
            var interceptor = !request.SkipAccessCheck
                ? await (new GetRegistersQueryInterceptor(_identityService, _currentUser))
                    //.Get(CustomPolicies.Registers.List.Name, CustomPolicies.Registers.ListAllRegisteredCompaniesEntrepreneurs.Name);
                    .Get(CustomPolicies.Registers.List.Name)
                : x => true;
            var organizations = _context.Organizations
                .Include(i => i.Municipality)
                    .ThenInclude(x=> x.StateEntity)
                .Where(interceptor)
                .Where(x => !x.IsDeleted)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                search = search.Replace(" ", "");
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
                organizations = organizations.Where(x => x.StateEntityId == request.EntityId.Value);
            }

            var response = await organizations
                .ApplyOrderByFunctions(request.GetOrderByFunction())
                .ProjectToType<CompanyEntrepreneurDto>()
                .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);

            await _logger.Add(new ActivityLogDto
            {
                UserId = _currentUser.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved All Registerd Companies/Entrepreneurs"
            });

            return response;
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to retrieve All Registerd Companies/Entrepreneurs", _currentUser.UserId);
            throw;
        }
    }
}
