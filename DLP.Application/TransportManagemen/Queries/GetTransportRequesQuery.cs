using System.Linq.Expressions;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Application.TransportManagemen.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.TransportManagemen.Queries
{
    public class GetTransportRequesQuery : IOrderingQuery<TransportRequest>, IRequest<OrdinalPaginatedList<TransportRequestDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public TransportRequestStatus? Status { get; set; }
        public string Search { get; set; }
        public bool IsFromExport { get; set; } = false;
        // Sorting

        private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

        private static readonly IReadOnlyDictionary<string, Expression<Func<TransportRequest, object?>>> OrderingPropertyMappings =
            new Dictionary<string, Expression<Func<TransportRequest, object?>>>(StringComparer)
            {
            { "requestId", x => x.RequestId },
            { "totalDistance", x => x.TotalDistance },
            { "createdAt", x => x.CreatedAt },
            { "status", x => x.Status },
             { "posiblePickup", x => x.TransportPickup
            .OrderBy(p => p.PostalCode)
            .Select(p => p.PostalCode)
            .FirstOrDefault()
            },
             { "requestedDelivery", x => x.TransportDelivery
            .OrderBy(p => p.PostalCode)
            .Select(p => p.PostalCode)
            .FirstOrDefault()
            },
            };

        private static readonly OrderByFunction<TransportRequest> DefaultOrdering = new(x => x.CreatedAt, true);

        private static IReadOnlySet<string>? PropertyKeys { get; set; }

        //Sorting

        public SortingBy? Sorting { get; set; }
        public OrderByFunction<TransportRequest> GetDefaultOrdering() => DefaultOrdering;
        public IReadOnlyDictionary<string, Expression<Func<TransportRequest, object?>>> GetOrderingPropertyMappings() => OrderingPropertyMappings;
        public IReadOnlySet<string> GetPropertyKeys()
        {
            PropertyKeys ??= OrderingPropertyMappings.Keys.ToHashSet(StringComparer);
            return PropertyKeys;
        }
        // end Sorting
    }


    public class GetTransportRequesQueryHandler : IRequestHandler<GetTransportRequesQuery, OrdinalPaginatedList<TransportRequestDto>>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IIdentityService _identityService;
        private readonly IActivityLogger _activityLogger;

        public GetTransportRequesQueryHandler(IAppDbContext context, ICurrentUserService currentUserService, IIdentityService identityService, IActivityLogger activityLogger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _identityService = identityService;
            _activityLogger = activityLogger;
        }

        public async Task<OrdinalPaginatedList<TransportRequestDto>> Handle(GetTransportRequesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var isAdmin = _currentUserService.AccessLevel == AccessLevelType.SuperAdministrator;
                var transportRequests = _context.TransportRequests
                            .Include(x => x.TransportPickup)
                                 .ThenInclude(p => p.Country)
                            .Include(x => x.TransportDelivery)
                                 .ThenInclude(p => p.Country)
                            .Include(x => x.TransportGoods)
                                 .ThenInclude(p => p.TypeOfGoods)
                            .Include(x => x.TransportInformation)
                            .Include(x => x.TransportCarrier.Where(c => !c.IsDeleted && c.IsAdminApproved && c.Status == TransportCarrierStatus.Accepted))
                            .Where(r => !r.IsTemplate && !r.IsDeleted)
                            .AsQueryable();


                if (!isAdmin)
                {
                    transportRequests = transportRequests.Where(u => u.OrganizationId == _currentUserService.OrganizationId);

                }

                if (request.Status.HasValue && Enum.IsDefined(typeof(TransportRequestStatus), request.Status.Value))
                {
                    transportRequests = transportRequests.Where(u => u.Status == request.Status.Value);
                }

                if (!string.IsNullOrEmpty(request.Search))
                {
                    string search = request.Search.Replace(" ", "");
                    //transportRequests = transportRequests.Where(r => r.RequestId.Contains(search)
                    //                    || r.TotalDistance.ToString().Contains(search));

                    transportRequests = transportRequests.Where(r =>
                     r.RequestId.Contains(search) ||
                     r.TotalDistance.ToString().Contains(search) ||

                     // ✅ Pickup Postal Code
                     r.TransportPickup.Any(p => p.PostalCode.Contains(search)) ||

                     // ✅ Pickup City
                     r.TransportPickup.Any(p => p.City.Contains(search)) ||

                     // ✅ Delivery Postal Code
                     r.TransportDelivery.Any(d => d.PostalCode.Contains(search)) ||

                     // ✅ Delivery City
                     r.TransportDelivery.Any(d => d.City.Contains(search)) || 

                     r.Organization.Name.Contains(search)
                 );
                }


                OrdinalPaginatedList<TransportRequestDto> responseData;

                if (request.IsFromExport)
                {
                    var response = transportRequests
                    .ApplyOrderByFunctions(request.GetOrderByFunction())
                    .ProjectToType<TransportRequestDto>()
                    .ToList();
                    responseData = new OrdinalPaginatedList<TransportRequestDto>(response, response.Count, request.PageNumber, request.PageSize);
                }
                else
                {
                    responseData = await transportRequests
                          .ApplyOrderByFunctions(request.GetOrderByFunction())
                          .ProjectToType<TransportRequestDto>()
                          .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
                }


                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Successfully retrieved a list of transport requests",
                });



                return responseData;
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "An error occurred while handling the GetTransportRequesQuery", _currentUserService.UserId);
                throw;
            }
        }
    }
}