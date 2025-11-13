using System.Linq.Expressions;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Application.TransportManagemen.DTOs;
using DLP.Application.VehicleFleetRequests.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using DocumentFormat.OpenXml.Drawing;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using static DLP.Application.Common.Auth.CustomPolicies;

namespace DLP.Application.VehicleFleetRequests.Queries
{
    public class GetVehicleFleetRequestsQuery : IOrderingQuery<VehicleFleetRequest>, IRequest<OrdinalPaginatedList<ListVehicleFleetRequestDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public int? Status { get; set; }
        public string Search { get; set; }
        public bool IsFromExport { get; set; } = false;
        public bool IsCarrier { get; set; } = false;
        public bool ListArchived { get; set; }

        private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

        private static readonly IReadOnlyDictionary<string, Expression<Func<VehicleFleetRequest, object?>>> OrderingPropertyMappings =

           new Dictionary<string, Expression<Func<VehicleFleetRequest, object?>>>(StringComparer)
           {
                { "comments", x => x.Comments },
                { "createdAt", x => x.CreatedAt },
                { "status", x => x.Status },
           };

        private static readonly OrderByFunction<VehicleFleetRequest> DefaultOrdering = new(x => x.CreatedAt, true);

        private static IReadOnlySet<string>? PropertyKeys { get; set; }

        public SortingBy? Sorting { get; set; }
        public OrderByFunction<VehicleFleetRequest> GetDefaultOrdering() => DefaultOrdering;

        public IReadOnlyDictionary<string, Expression<Func<VehicleFleetRequest, object?>>> GetOrderingPropertyMappings() => OrderingPropertyMappings;
        public IReadOnlySet<string> GetPropertyKeys()
        {
            PropertyKeys ??= OrderingPropertyMappings.Keys.ToHashSet(StringComparer);
            return PropertyKeys;
        }
    }
    public class GetVehicleFleetRequestsQueryHandler : IRequestHandler<GetVehicleFleetRequestsQuery, OrdinalPaginatedList<ListVehicleFleetRequestDto>>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IActivityLogger _activityLogger;

        public GetVehicleFleetRequestsQueryHandler(IAppDbContext context,
            ICurrentUserService currentUserService,
            IActivityLogger activityLogger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _activityLogger = activityLogger;
        }

        public async Task<OrdinalPaginatedList<ListVehicleFleetRequestDto>> Handle(GetVehicleFleetRequestsQuery request, CancellationToken cancellationToken)
        {

            try
            {
                OrdinalPaginatedList<ListVehicleFleetRequestDto> responseData;
                var isAdmin = _currentUserService.AccessLevel == AccessLevelType.SuperAdministrator;
                var userId = _currentUserService.UserId;

                var query = _context.VehicleFleetRequests
                    .Include(vfr => vfr.Organization)
                    .Where(x => !x.IsDeleted && (!request.IsCarrier || x.CreatedById == userId));

                if (!string.IsNullOrWhiteSpace(request.Search))
                {
                    string search = request.Search.Trim().ToLower();

                    query = query.Where(r =>
                        (r.Comments != null && r.Comments.ToLower().Contains(search)) ||
                        (r.Organization.Name != null &&
                         r.Organization.Name.Contains(search))
                    );
                }

                if (!request.ListArchived)
                {
                    query = query.Where(r => r.Status == (int)VehicleFleetRequestStatus.Confirmed);
                }
                else if (request.Status > -1)
                {
                    query = query.Where(r => r.Status == request.Status);
                }

                if (!isAdmin)
                {
                    var employeeUserIds = await _context.Organizations
                        .Where(o => o.Id == _currentUserService.OrganizationId)
                        .SelectMany(o => o.Employees.Select(e => e.Id))
                        .ToListAsync();

                    query = query.Where(r => employeeUserIds.Contains(r.CreatedById));
                }

                // Pre-fetch total vehicles to avoid N+1 queries
                Dictionary<string, int> vehicleCounts = new();

                if (!request.ListArchived)
                {
                    vehicleCounts = await _context.Questionnaire
                        .Where(q => q.QuestionNo == 1)
                        .GroupBy(q => q.RequestId)
                        .Select(g => new
                        {
                            RequestId = g.Key,
                            Total = g.Select(x => (int?)x.Values).FirstOrDefault() ?? 0
                        })
                        .ToDictionaryAsync(x => x.RequestId, x => x.Total, cancellationToken);
                }

                // Materialize first
                var projectedList = await query
                    .Select(x => new ListVehicleFleetRequestDto
                    {
                        Id = x.Id,
                        OrdinalNumber = 0,
                        Name = x.Organization.Name,
                        CreatedAt = x.CreatedAt,
                        UpdatedAt = x.UpdatedAt ?? x.CreatedAt,
                        ActionedAt = x.ActionedAt,
                        Status = (VehicleFleetRequestStatus)x.Status,
                        StatusText = ((VehicleFleetRequestStatus)x.Status).ToString(),
                        Comments = x.Comments,
                        TotalVehicle = !request.ListArchived
                            ? (vehicleCounts.ContainsKey(x.Id.ToString()) ? vehicleCounts[x.Id.ToString()] : 0)
                            : 0
                    })
                    .ToListAsync(cancellationToken);

                // ✅ Sorting (works in memory, including TotalVehicle)
                if (request.Sorting != null && !string.IsNullOrEmpty(request.Sorting.PropertyName))
                {
                    bool ascending = !request.Sorting.IsDescending;
                    switch (request.Sorting.PropertyName.ToLower())
                    {
                        case "name":
                            projectedList = ascending
                                ? projectedList.OrderBy(x => x.Name).ToList()
                                : projectedList.OrderByDescending(x => x.Name).ToList();
                            break;
                        case "createdat":
                            projectedList = ascending
                                ? projectedList.OrderBy(x => x.CreatedAt).ToList()
                                : projectedList.OrderByDescending(x => x.CreatedAt).ToList();
                            break;
                        case "status":
                            projectedList = ascending
                                ? projectedList.OrderBy(x => x.Status).ToList()
                                : projectedList.OrderByDescending(x => x.Status).ToList();
                            break;
                        case "updatedat":
                            projectedList = ascending
                                ? projectedList.OrderBy(x => x.UpdatedAt).ToList()
                                : projectedList.OrderByDescending(x => x.UpdatedAt).ToList();
                            break;
                        case "actionedat":
                            projectedList = ascending
                                ? projectedList.OrderBy(x => x.ActionedAt).ToList()
                                : projectedList.OrderByDescending(x => x.ActionedAt).ToList();
                            break;
                        case "totalvehicle":
                            projectedList = ascending
                                ? projectedList.OrderBy(x => x.TotalVehicle).ToList()
                                : projectedList.OrderByDescending(x => x.TotalVehicle).ToList();
                            break;
                        case "comments":
                            projectedList = ascending
                                ? projectedList.OrderBy(x => x.Comments).ToList()
                                : projectedList.OrderByDescending(x => x.Comments).ToList();
                            break;
                        default:
                            projectedList = projectedList.OrderByDescending(x => x.CreatedAt).ToList();
                            break;
                    }
                }
                else
                {
                    projectedList = projectedList.OrderByDescending(x => x.CreatedAt).ToList();
                }

                // Add sequential numbering after sorting
                for (int i = 0; i < projectedList.Count; i++)
                {
                    projectedList[i].OrdinalNumber = i + 1;
                }

                // ✅ Export or Paginated response
                if (request.IsFromExport)
                {
                    var response = projectedList.ToList();
                    responseData = new OrdinalPaginatedList<ListVehicleFleetRequestDto>(
                        response,
                        response.Count,
                        request.PageNumber,
                        request.PageSize
                    );
                }
                else
                {
                    var paginatedData = projectedList
                        .Skip((request.PageNumber - 1) * request.PageSize)
                        .Take(request.PageSize)
                        .ToList();

                    responseData = new OrdinalPaginatedList<ListVehicleFleetRequestDto>(
                        paginatedData,
                        projectedList.Count,
                        request.PageNumber,
                        request.PageSize
                    );
                }

                // Activity log
                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Successfully retrieved a list of vehicle fleet requests"
                });

                return responseData;

            }
            catch (Exception ex)
            {
                throw;
            }
        }
    }
}
