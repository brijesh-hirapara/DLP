using System.Linq;
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
    public class GetCarrierTransportRequesQuery : IOrderingQuery<TransportRequest>, IRequest<OrdinalPaginatedList<TransportRequestDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public TransportCarrierStatus? Status { get; set; }
        public bool ListArchived { get; set; }
        public string Search { get; set; }
        public string? PickupPostalCode { get; set; }
        public string? DeliveryPostalCode { get; set; }
        public DateTime? PickupDate { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public bool IsFromExport { get; set; } = false;
        // Sorting

        private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

        private static readonly IReadOnlyDictionary<string, Expression<Func<TransportRequest, object?>>> OrderingPropertyMappings =
            new Dictionary<string, Expression<Func<TransportRequest, object?>>>(StringComparer)
            {
            { "createdAt", x => x.CreatedAt },
            { "status", x => x.Status },
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


    public class GetCarrierTransportRequesQueryHandler : IRequestHandler<GetCarrierTransportRequesQuery, OrdinalPaginatedList<TransportRequestDto>>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IIdentityService _identityService;
        private readonly IActivityLogger _activityLogger;

        public GetCarrierTransportRequesQueryHandler(IAppDbContext context, ICurrentUserService currentUserService, IIdentityService identityService, IActivityLogger activityLogger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _identityService = identityService;
            _activityLogger = activityLogger;
        }

        public async Task<OrdinalPaginatedList<TransportRequestDto>> Handle(GetCarrierTransportRequesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query = _context.TransportCarriers
                                    .Where(x => x.OrganizationId == _currentUserService.OrganizationId
                                         && !x.IsDeleted
                                         && !x.IsAdminApproved);

                if (!request.ListArchived)
                {
                    // Only Pending when not archived
                    query = query.Where(x => x.Status == TransportCarrierStatus.Pending);
                }

                var transportRequestsIds = await query
                    .Select(x => x.TransportRequestId)
                    .Distinct()
                    .ToListAsync(cancellationToken);

                var transportRequests = _context.TransportRequests
                                        .Include(x => x.TransportPickup).ThenInclude(p => p.Country)
                                        .Include(x => x.TransportDelivery).ThenInclude(p => p.Country)
                                        .Include(x => x.TransportGoods).ThenInclude(p => p.TypeOfGoods)
                                        .Include(x => x.TransportInformation).ThenInclude(p => p.Currency)
                                        .Include(x => x.TransportCarrier.Where(x => x.OrganizationId == _currentUserService.OrganizationId))
                                        .Where(r => !r.IsTemplate && transportRequestsIds.Contains(r.Id))
                                        .AsQueryable();


                if (request.Status.HasValue && request.Status > 0)
                {
                    transportRequests = transportRequests.Where(r => r.TransportCarrier.Any(tc => tc.Status == request.Status));
                }

                if (!string.IsNullOrEmpty(request.Search))
                {
                    string search = request.Search.Replace(" ", "");

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
                        r.TransportDelivery.Any(d => d.City.Contains(search))
                    );
                }

                if (request.PickupDate.HasValue)
                {
                    var pickupDate = request.PickupDate.Value.Date;

                    transportRequests = transportRequests
                        .Where(r => r.TransportInformation
                            .Any(ti => ti.PickupDateFrom.HasValue &&
                                       ti.PickupDateFrom.Value.Date == pickupDate));
                }


                if (request.DeliveryDate.HasValue)
                {
                    var deliveryDate = request.DeliveryDate.Value.Date;

                    transportRequests = transportRequests
                           .Where(r => r.TransportInformation
                               .Any(ti => ti.DeliveryDateFrom.HasValue &&
                                          ti.DeliveryDateFrom.Value.Date == deliveryDate));
                }

                if (!string.IsNullOrWhiteSpace(request.PickupPostalCode))
                {
                    transportRequests = transportRequests
                        .Where(r => r.TransportPickup != null &&
                                    r.TransportPickup.Any(ti => ti.PostalCode.Contains(request.PickupPostalCode)));
                }

                if (!string.IsNullOrWhiteSpace(request.DeliveryPostalCode))
                {
                    transportRequests = transportRequests
                        .Where(r => r.TransportDelivery != null &&
                                    r.TransportDelivery.Any(ti => ti.PostalCode.Contains(request.DeliveryPostalCode)));
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


                    // force filter at DTO level
                    responseData.Items.ForEach(x =>
                    {
                        x.TransportCarrier = x.TransportCarrier
                            .Where(tc => tc.OrganizationId == _currentUserService.OrganizationId)
                            .ToList();
                    });
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
