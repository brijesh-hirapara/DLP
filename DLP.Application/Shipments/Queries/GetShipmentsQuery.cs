using System.Linq.Expressions;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Application.Shipments.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Shipments.Queries
{
    public class GetShipmentsQuery : IOrderingQuery<Shipment>, IRequest<OrdinalPaginatedList<ShipmentsDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public ShipmentsStatus? Status { get; set; }
        public string Search { get; set; }
        public bool IsFromExport { get; set; } = false;
        // Sorting

        private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

        private static readonly IReadOnlyDictionary<string, Expression<Func<Shipment, object?>>> OrderingPropertyMappings =
            new Dictionary<string, Expression<Func<Shipment, object?>>>(StringComparer)
            {
            { "requestId", x => x.RequestId },
            { "createdAt", x => x.CreatedAt },
            { "status", x => x.Status },
              { "possiblePickup", x => x.TransportRequest.TransportPickup
            .OrderBy(p => p.PostalCode)
            .Select(p => p.PostalCode)
            .FirstOrDefault()
            },
             { "requestedDelivery", x => x.TransportRequest.TransportDelivery
            .OrderBy(p => p.PostalCode)
            .Select(p => p.PostalCode)
            .FirstOrDefault()
            },
            };

        private static readonly OrderByFunction<Shipment> DefaultOrdering = new(x => x.CreatedAt, true);

        private static IReadOnlySet<string>? PropertyKeys { get; set; }

        //Sorting

        public SortingBy? Sorting { get; set; }
        public OrderByFunction<Shipment> GetDefaultOrdering() => DefaultOrdering;
        public IReadOnlyDictionary<string, Expression<Func<Shipment, object?>>> GetOrderingPropertyMappings() => OrderingPropertyMappings;
        public IReadOnlySet<string> GetPropertyKeys()
        {
            PropertyKeys ??= OrderingPropertyMappings.Keys.ToHashSet(StringComparer);
            return PropertyKeys;
        }
        // end Sorting
    }


    public class GetShipmentsQueryHandler : IRequestHandler<GetShipmentsQuery, OrdinalPaginatedList<ShipmentsDto>>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IIdentityService _identityService;
        private readonly IActivityLogger _activityLogger;

        public GetShipmentsQueryHandler(IAppDbContext context, ICurrentUserService currentUserService, IIdentityService identityService, IActivityLogger activityLogger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _identityService = identityService;
            _activityLogger = activityLogger;
        }

        public async Task<OrdinalPaginatedList<ShipmentsDto>> Handle(GetShipmentsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var isAdmin = _currentUserService.AccessLevel == AccessLevelType.SuperAdministrator;

                var shipmentsList = _context.Shipments
                            .Include(x => x.TransportRequest)
                                .ThenInclude(p => p.TransportPickup)
                                    .ThenInclude(t => t.Country)
                            .Include(x => x.TransportRequest)
                                .ThenInclude(p => p.TransportDelivery)
                                    .ThenInclude(t => t.Country)
                            .Include(x => x.TransportRequest)
                                .ThenInclude(p => p.TransportInformation)
                            .Include(x => x.TransportRequest)
                                .ThenInclude(p => p.TransportCarrier.Where(y=>y.IsShipperBook && !y.IsDeleted && y.Status == TransportCarrierStatus.Accepted))
                            .Include(x=>x.ShipperOrganization)
                            .Include(x=>x.CarrierOrganization)

                            .Where(r => r.IsActive && !r.IsDeleted)
                            .AsQueryable();


                if (!isAdmin)
                {
                    shipmentsList = shipmentsList.Where(u => u.ShipperOrganizationId == _currentUserService.OrganizationId);

                }

                if (request.Status.HasValue && Enum.IsDefined(typeof(ShipmentsStatus), request.Status.Value))
                {
                    shipmentsList = shipmentsList.Where(u => u.Status == request.Status.Value);
                }

                if (!string.IsNullOrEmpty(request.Search))
                {
                    string search = request.Search.Replace(" ", "");
                    shipmentsList = shipmentsList.Where(r => r.RequestId.Contains(search));

                    shipmentsList = shipmentsList.Where(r =>
                     r.RequestId.Contains(search) ||

                     // ✅ Pickup Postal Code
                     r.TransportRequest.TransportPickup.Any(p => p.PostalCode.Contains(search)) ||

                     // ✅ Pickup City
                     r.TransportRequest.TransportPickup.Any(p => p.City.Contains(search)) ||

                     // ✅ Delivery Postal Code
                     r.TransportRequest.TransportDelivery.Any(d => d.PostalCode.Contains(search)) ||

                     // ✅ Delivery City
                     r.TransportRequest.TransportDelivery.Any(d => d.City.Contains(search)) 

                 );
                }

                OrdinalPaginatedList<ShipmentsDto> responseData;

                if (request.IsFromExport)
                {
                    var response = shipmentsList
                    .ApplyOrderByFunctions(request.GetOrderByFunction())
                    .ProjectToType<ShipmentsDto>()
                    .ToList();
                    responseData = new OrdinalPaginatedList<ShipmentsDto>(response, response.Count, request.PageNumber, request.PageSize);
                    responseData.Items.ForEach(x =>
                    {
                        x.TransportCarrier = x.TransportCarrier
                            .Where(tc => tc.OrganizationId == x.CarrierOrganizationId)
                            .ToList();
                    });
                }
                else
                {
                    responseData = await shipmentsList
                          .ApplyOrderByFunctions(request.GetOrderByFunction())
                          .ProjectToType<ShipmentsDto>()
                          .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
                       // force filter at DTO level
                    responseData.Items.ForEach(x =>
                    {
                        x.TransportCarrier = x.TransportCarrier
                            .Where(tc => tc.OrganizationId == x.CarrierOrganizationId)
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
                await _activityLogger.Exception(ex.Message, "An error occurred while handling the GetShipmentsQuery", _currentUserService.UserId);
                throw;
            }
        }
    }
}