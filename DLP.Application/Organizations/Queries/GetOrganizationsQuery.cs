using System.Linq.Expressions;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Application.Organizations.DTOs;
using DLP.Application.Users.DTO;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using static DLP.Application.Common.Auth.CustomPolicies;

namespace DLP.Application.Organizations.Queries;

public class GetOrganizationsQuery : IOrderingQuery<Organization>,IRequest<OrdinalPaginatedList<OrganizationDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string SortBy { get; set; }
    public string SortType { get; set; }
    public string Search { get; set; }
    public Guid? MunicipalityId { get; set; }
    public Guid? EntityId { get; set; }
    public OrganizationTypeEnum? Type { get; set; }
    public bool IsFromExport { get; set; } = false;

    private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

    private static readonly IReadOnlyDictionary<string, Expression<Func<Organization, object?>>> OrderingPropertyMappings =

       new Dictionary<string, Expression<Func<Organization, object?>>>(StringComparer)
       {
                { "name", x => x.Name },
                { "type", x => x.Type },
                { "status", x => x.Status },
       };

    private static readonly OrderByFunction<Organization> DefaultOrdering = new(x => x.CreatedAt, true);

    private static IReadOnlySet<string>? PropertyKeys { get; set; }

    public SortingBy? Sorting { get; set; }
    public OrderByFunction<Organization> GetDefaultOrdering() => DefaultOrdering;

    public IReadOnlyDictionary<string, Expression<Func<Organization, object?>>> GetOrderingPropertyMappings() => OrderingPropertyMappings;
    public IReadOnlySet<string> GetPropertyKeys()
    {
        PropertyKeys ??= OrderingPropertyMappings.Keys.ToHashSet(StringComparer);
        return PropertyKeys;
    }
}

public class GetOrganizationsQueryHandler : IRequestHandler<GetOrganizationsQuery, OrdinalPaginatedList<OrganizationDto>>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUserService;

    public GetOrganizationsQueryHandler(IAppDbContext context, IActivityLogger activityLogger, ICurrentUserService currentUserService)
    {
        _context = context;
        _activityLogger = activityLogger;
        _currentUserService = currentUserService;
    }

    public async Task<OrdinalPaginatedList<OrganizationDto>> Handle(GetOrganizationsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var search = request.Search;
            var municipalityId = request.MunicipalityId;
            var entityId = request.EntityId;

            var organizations = _context.Organizations
                .Include(i => i.Municipality)
                .Include(i => i.Municipality.Canton)
                .Include(i => i.Municipality.StateEntity)
                .Include(i => i.BusinessActivity)
                .Include(i => i.CreatedBy)
                .Include(i => i.ContactPerson)
                .Include(i => i.Employees)
                .ThenInclude(x => x.UserRoles)
                .ThenInclude(x => x.Role)
                .Where(m =>
                    !m.IsDeleted &&
                    (string.IsNullOrEmpty(search)
                    || m.Name.ToLower().Trim().Contains(search.ToLower().Trim())
                ))
                .OrderByDescending(x => x.CreatedAt)
                .AsQueryable();


            if (request.Type.HasValue && request.Type > 0)
            {
                organizations = organizations.Where(u => u.Type == request.Type);
            }

            if (municipalityId.HasValue)
            {
                organizations = organizations.Where(x => x.MunicipalityId == municipalityId.Value);
            }
            if (entityId.HasValue)
            {
                organizations = organizations.Where(x => x.StateEntityId == entityId.Value);
            }

            OrdinalPaginatedList<OrganizationDto> paginatedData;

            if (request.IsFromExport)
            {
                var organizationDtos = organizations.ApplyOrderByFunctions(request.GetOrderByFunction()).ProjectToType<OrganizationDto>().ToList();
                paginatedData = new OrdinalPaginatedList<OrganizationDto>(organizationDtos, organizationDtos.Count, request.PageNumber, request.PageSize);
            }

            else
            {
                paginatedData = await organizations
                .ApplyOrderByFunctions(request.GetOrderByFunction())
                .ProjectToType<OrganizationDto>()
                .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
            }

            foreach (var item in paginatedData.Items)
            {
                var requestDetail = _context.Requests.AsNoTracking().Where(x => x.ContactPersonEmail == item.ContactPersonEmail).OrderByDescending(x => x.CreatedAt).FirstOrDefault(); 
                item.DateOfRegistration = requestDetail?.CreatedAt;
            }


            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Organizations retrieved successfully."
            });

            return paginatedData;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to retrieve organizations", _currentUserService.UserId);
            throw;
        }
    }
}
