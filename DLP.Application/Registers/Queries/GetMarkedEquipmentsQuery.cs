using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Application.Registers.DTOs;
using DLP.Application.Requests.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace DLP.Application.Registers.Queries;

public class GetMarkedEquipmentsQuery : IOrderingQuery<Equipment>, IRequest<OrdinalPaginatedList<MarkedEquipmentDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string Search { get; set; }
    public Guid? MunicipalityId { get; set; }
    public Guid? CompanyId { get; set; }
    public string? TypeOfEquipmentId { get; set; }
    public bool SkipAccessCheck { get; set; }
    public bool IsFromExport { get; set; } = false;

    // Sorting

    private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

    private static readonly IReadOnlyDictionary<string, Expression<Func<Equipment, object?>>> OrderingPropertyMappings =
        new Dictionary<string, Expression<Func<Equipment, object?>>>(StringComparer)
        {
            { "equipmentIdNumber", x => x.SerialNumber},
            { "typeOfEquipment", x => x.TypeOfEquipment != null ? x.TypeOfEquipment.Name : x.TypeOfEquipmentOther },
            { "ownerCompany", x => x.CompanyBranch != null ? x.CompanyBranch.Organization.Name : ""},
            { "municipality", x => x.CompanyBranch != null ? x.CompanyBranch.Municipality.Name : ""},
        };

    private static readonly OrderByFunction<Equipment> DefaultOrdering = new(x => x.CreatedAt, true);

    private static IReadOnlySet<string>? PropertyKeys { get; set; }

    //Sorting

    public SortingBy? Sorting { get; set; }
    public OrderByFunction<Equipment> GetDefaultOrdering() => DefaultOrdering;
    public IReadOnlyDictionary<string, Expression<Func<Equipment, object?>>> GetOrderingPropertyMappings() => OrderingPropertyMappings;
    public IReadOnlySet<string> GetPropertyKeys()
    {
        PropertyKeys ??= OrderingPropertyMappings.Keys.ToHashSet(StringComparer);
        return PropertyKeys;
    }
    // end Sorting
}

public class GetMarkedEquipmentsQueryHandler : IRequestHandler<GetMarkedEquipmentsQuery, OrdinalPaginatedList<MarkedEquipmentDto>>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _logger;
    private readonly ICurrentUserService _currentUser;
    private readonly IIdentityService _identityService;

    public GetMarkedEquipmentsQueryHandler(IAppDbContext context, IActivityLogger logger, IIdentityService identityService, ICurrentUserService currentUser)
    {
        _context = context;
        _logger = logger;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<OrdinalPaginatedList<MarkedEquipmentDto>> Handle(GetMarkedEquipmentsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var interceptor = !request.SkipAccessCheck
                ? await (new GetEquipmentsQueryInterceptor(_identityService, _currentUser)).Get()
                : x => true;
            var equipments = _context.Equipments.Where(e => !e.IsDeleted)
                .Include(x => x.CompanyBranch)
                    .ThenInclude(x => x.Organization)
                    .ThenInclude(x => x.Municipality)
                .Include(x => x.TypeOfEquipment)
                .Where(interceptor)
                .AsQueryable();

            if (!string.IsNullOrEmpty(request.Search))
            {
                string search = request.Search.ToLower();
                equipments = equipments.Where(e =>
                    (e.CompanyBranch != null && e.CompanyBranch.Organization.Name.ToLower().Contains(search)) ||
                    (e.CompanyBranch != null && e.CompanyBranch.Municipality.Name.ToLower().Contains(search)) ||
                    (e.TypeOfEquipment != null && e.TypeOfEquipment.Name.ToLower().Contains(search)) ||
                    e.SerialNumber.ToLower().Contains(search) ||
                    e.TypeOfEquipmentOther.ToLower().Contains(search)
                );
            }

            if (request.MunicipalityId.HasValue)
            {
                equipments = equipments.Where(x => x.CompanyBranch.MunicipalityId == request.MunicipalityId.Value);
            }

            if (!string.IsNullOrEmpty(request.TypeOfEquipmentId))
            {
                if (request.TypeOfEquipmentId.Equals("-1"))
                {
                    equipments = equipments.Where(x => x.TypeOfEquipmentOther != null);
                }
                else
                {
                    var typeOfEquipmentId = new Guid(request.TypeOfEquipmentId);
                    equipments = equipments.Where(x => x.TypeOfEquipmentId == typeOfEquipmentId);
                }
            }

            if (request.CompanyId.HasValue)
            {
                equipments = equipments.Where(x => x.CompanyBranch.OrganizationId == request.CompanyId.Value);
            }

            OrdinalPaginatedList<MarkedEquipmentDto> responseData;
            if (request.IsFromExport)
            {
                var response = equipments
               .ApplyOrderByFunctions(request.GetOrderByFunction())
               .ProjectToType<MarkedEquipmentDto>()
               .ToList();
                responseData = new OrdinalPaginatedList<MarkedEquipmentDto>(response, response.Count, request.PageNumber, request.PageSize);
            }
            else
            {
                responseData = await equipments
               .ApplyOrderByFunctions(request.GetOrderByFunction())
               .ProjectToType<MarkedEquipmentDto>()
               .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
            }
               

            await _logger.Add(new ActivityLogDto
            {
                UserId = _currentUser.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved Marked Equipments"
            });

            return responseData;
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to retrieve Marked Equipments", _currentUser.UserId);
            throw;
        }
    }
}
