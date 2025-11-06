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

public class GetOwnersOperatorsOfEquipmentsQuery : IOrderingQuery<Organization>, IRequest<OrdinalPaginatedList<OwnerOperatorOfEquipmentDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string Search { get; set; }
    public Guid? MunicipalityId { get; set; }
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
            { "nrOfBranches", x => x.Branches.Count(x => !x.IsDeleted) },
            { "nrOfEquipments", x => x.Branches
                .Where(x => !x.IsDeleted)
                .SelectMany(x => x.Equipments)
                .Count(x => !x.IsDeleted)
            },
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

public class GetOwnersOperatorsOfEquipmentsQueryHandler : IRequestHandler<GetOwnersOperatorsOfEquipmentsQuery, OrdinalPaginatedList<OwnerOperatorOfEquipmentDto>>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _logger;
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUser;

    public GetOwnersOperatorsOfEquipmentsQueryHandler(IAppDbContext context, IActivityLogger logger, IIdentityService identityService, ICurrentUserService currentUser)
    {
        _context = context;
        _logger = logger;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<OrdinalPaginatedList<OwnerOperatorOfEquipmentDto>> Handle(GetOwnersOperatorsOfEquipmentsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var search = request.Search;
            //var interceptor = !request.SkipAccessCheck
            //    ? await (new GetRegistersQueryInterceptor(_identityService, _currentUser))
            //        .Get(CustomPolicies.Registers.List.Name,
            //            CustomPolicies.Registers.ListRegistersOfOwnersAndOperatorsOfKghEquipment.Name)
            //    : x => true;
            Expression<Func<Organization, bool>> interceptor = x => true;
            var organizations = _context.Organizations
                .Include(i => i.Branches)
                .Include(i => i.Municipality)
                .ThenInclude(i=>i.StateEntity)
                .Include(i => i.CompanyRegisterTypes)
                .Where(interceptor)
                .Where(x => !x.IsDeleted &&
                    (x.Type != OrganizationTypeEnum.INSTITUTION) &&
                    x.CompanyRegisterTypes.Any(t => t.Type == CompanyType.OwnerAndOperator))
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
                organizations = organizations.Where(x => x.Municipality.StateEntityId == request.EntityId.Value);
            }

            OrdinalPaginatedList<OwnerOperatorOfEquipmentDto> responseData;

            if (request.IsFromExport)
            {
                var response = organizations
                .ApplyOrderByFunctions(request.GetOrderByFunction())
                .ProjectToType<OwnerOperatorOfEquipmentDto>()
                .ToList();
                responseData = new OrdinalPaginatedList<OwnerOperatorOfEquipmentDto>(response, response.Count, request.PageNumber, request.PageSize);
            }
            else
            {
                responseData = await organizations
                .ApplyOrderByFunctions(request.GetOrderByFunction())
                .ProjectToType<OwnerOperatorOfEquipmentDto>()
                .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
            }



            await _logger.Add(new ActivityLogDto
            {
                UserId = _currentUser.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved Owners/Operators of Equipments"
            });

            return responseData;
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to retrieve Owners/Operators of Equipments", _currentUser.UserId);
            throw;
        }
    }
}



