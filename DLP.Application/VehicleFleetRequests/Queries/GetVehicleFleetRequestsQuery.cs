using System.Linq.Expressions;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Application.VehicleFleetRequests.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using DocumentFormat.OpenXml.Drawing;
using MediatR;
using Microsoft.EntityFrameworkCore;

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
                var query =
                            from vfr in _context.VehicleFleetRequests
                            join user in _context.Users on vfr.CreatedById equals user.Id
                            join org in _context.Organizations on user.OrganizationId equals org.Id
                            join queGroup in _context.Questionnaire
                                on EF.Functions.Collate(vfr.Id.ToString(), "utf8mb4_general_ci")
                                   equals EF.Functions.Collate(queGroup.RequestId, "utf8mb4_general_ci") into queJoin
                            from que in queJoin
                                .Where(q => q.QuestionNo == 1)
                                .Take(1)
                                .DefaultIfEmpty()
                            where !vfr.IsDeleted && (!request.IsCarrier || vfr.CreatedById == userId)
                            select new
                            {
                                VehicleFleetRequest = vfr,
                                OrganizationName = org.Name,
                                Questionnaire = que
                            };


                if (!string.IsNullOrWhiteSpace(request.Search))
                {
                    string search = request.Search.Trim();

                    query = query.Where(r =>
                        r.VehicleFleetRequest.Comments != null && r.VehicleFleetRequest.Comments.ToLower().Contains(search.ToLower()) ||
                        r.OrganizationName != null && r.OrganizationName.ToLower().Contains(search.ToLower())
                    );
                }

                if (!request.ListArchived)
                {
                    query = query.Where(r => r.VehicleFleetRequest.Status == (int)VehicleFleetRequestStatus.Confirmed);
                }
                else
                {
                    if (request.Status > -1)
                    {
                        query = query.Where(r => r.VehicleFleetRequest.Status == request.Status);
                    }
                }


                if (!isAdmin)
                {
                    var employeeUserIds = _context.Organizations
                        .Where(o => o.Id == _currentUserService.OrganizationId)
                        .SelectMany(o => o.Employees.Select(e => e.Id)) // Assuming Employee has a UserId property
                        .ToList();

                    query = query.Where(r => employeeUserIds.Contains(r.VehicleFleetRequest.CreatedById));

                }
                var projectedQuery = query
            .Select(x => new ListVehicleFleetRequestDto
            {
                Id = x.VehicleFleetRequest.Id,
                OrdinalNumber = 0,
                Name = x.OrganizationName,             // ✅ Organization name here
                CreatedAt = x.VehicleFleetRequest.CreatedAt,
                UpdatedAt = x.VehicleFleetRequest.UpdatedAt ?? x.VehicleFleetRequest.CreatedAt,
                ActionedAt = x.VehicleFleetRequest.ActionedAt,
                Status = (VehicleFleetRequestStatus)x.VehicleFleetRequest.Status,
                StatusText = ((VehicleFleetRequestStatus)x.VehicleFleetRequest.Status).ToString(),
                Comments = x.VehicleFleetRequest.Comments,
                TotalVehicle = x.Questionnaire != null ? (int?)x.Questionnaire.Values ?? 0 : 0
            });




                // Manual sorting
                if (request.Sorting != null && !string.IsNullOrEmpty(request.Sorting.PropertyName))
                {
                    bool ascending = request.Sorting.IsDescending;
                    switch (request.Sorting.PropertyName.ToLower())
                    {
                        case "name":
                            projectedQuery = ascending
                                ? projectedQuery.OrderBy(x => x.Name)
                                : projectedQuery.OrderByDescending(x => x.Name);
                            break;

                        case "createdat":
                            projectedQuery = ascending
                                ? projectedQuery.OrderBy(x => x.CreatedAt)
                                : projectedQuery.OrderByDescending(x => x.CreatedAt);
                            break;

                        case "status":
                            projectedQuery = ascending
                                ? projectedQuery.OrderBy(x => x.Status)
                                : projectedQuery.OrderByDescending(x => x.Status);
                            break;

                        case "updatedat":
                            projectedQuery = ascending
                                ? projectedQuery.OrderBy(x => x.UpdatedAt)
                                : projectedQuery.OrderByDescending(x => x.UpdatedAt);
                            break;

                        case "actionedat":
                            projectedQuery = ascending
                                ? projectedQuery.OrderBy(x => x.ActionedAt)
                                : projectedQuery.OrderByDescending(x => x.ActionedAt);
                            break;

                        case "totalvehicle":
                            projectedQuery = ascending
                                ? projectedQuery.OrderBy(x => x.TotalVehicle)
                                : projectedQuery.OrderByDescending(x => x.TotalVehicle);
                            break;
                        case "comments":
                            projectedQuery = ascending
                                ? projectedQuery.OrderBy(x => x.Comments)
                                : projectedQuery.OrderByDescending(x => x.Comments);
                            break;
                        default:
                            // Default sorting
                            projectedQuery = projectedQuery.OrderByDescending(x => x.CreatedAt);
                            break;

                    }
                }
                else
                {
                    // Default sorting
                    projectedQuery = projectedQuery.OrderByDescending(x => x.CreatedAt);
                }


                if (request.IsFromExport)
                {
                    var response = projectedQuery
                    .ToList();
                    responseData = new OrdinalPaginatedList<ListVehicleFleetRequestDto>(response, response.Count, request.PageNumber, request.PageSize);
                }
                else
                {
                    responseData = await projectedQuery
                  .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
                }




                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Successfully retrieved a list of vehicle fleet requests",
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
