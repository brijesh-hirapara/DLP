

using System.Linq.Expressions;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Application.Organizations.DTOs;
using DLP.Application.TransportManagemen.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.TransportManagemen.Queries
{
    public class GetActiveCarrierQuery : IOrderingQuery<Organization>, IRequest<OrdinalPaginatedList<OrganizationCarrierDto>>
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

    public class GetActiveCarrierQueryHandler : IRequestHandler<GetActiveCarrierQuery, OrdinalPaginatedList<OrganizationCarrierDto>>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUserService;

        public GetActiveCarrierQueryHandler(IAppDbContext context, IActivityLogger activityLogger, ICurrentUserService currentUserService)
        {
            _context = context;
            _activityLogger = activityLogger;
            _currentUserService = currentUserService;
        }

        public async Task<OrdinalPaginatedList<OrganizationCarrierDto>> Handle(GetActiveCarrierQuery request, CancellationToken cancellationToken)
        {
            try
            {

                var vehicleFleetRequestsIds = await _context.VehicleFleetRequests
                                 .Where(x => x.Status == (int)VehicleFleetRequestStatus.Confirmed)
                                 .Select(x => x.Id)
                                 .ToListAsync();

                //var requestList = await _context.Requests
                //                 .Where(x =>x.Type == RequestType.RegistraterAsCarrier &&
                //                     x.Status == RequestStatus.Approved)
                //                 .Select(x => x.IdNumber)
                //                 .ToListAsync();

                var carrierOrganizationIds = await _context.Organizations
                                     .Where(x =>
                                         x.Type == OrganizationTypeEnum.CARRIER &&
                                         !x.IsDeleted &&
                                         x.CountryId != Guid.Empty) // ✅ filters out default GUID (00000000-0000-0000-0000-000000000000)
                                     .Select(x => x.Id)
                                     .ToListAsync(cancellationToken);


                // Step 4: Get valid transport carriers linked to those organizations and confirmed fleet requests
                var transportCarriers = await _context.VehicleFleetRequests
                    .Include(o => o.Organization)
                    .Where(x =>
                        x.Status == (int)VehicleFleetRequestStatus.Confirmed &&
                        vehicleFleetRequestsIds.Contains(x.Id) &&
                        carrierOrganizationIds.Contains(x.OrganizationId.Value) &&
                        x.Organization.Type == OrganizationTypeEnum.CARRIER &&
                        !x.IsDeleted &&
                        !x.Organization.IsDeleted)
                    .Select(x => new
                    {
                        Id = x.OrganizationId.Value,
                    })
                    .Distinct()
                    .ToListAsync();

                var transportCarrierIds = transportCarriers
                                        .Select(x => x.Id)
                                        .ToList();

                var organizations = _context.Organizations
                    .Where(m =>
                        !m.IsDeleted && transportCarrierIds.Contains(m.Id))
                    .OrderByDescending(x => x.CreatedAt)
                    .AsQueryable();



                OrdinalPaginatedList<OrganizationCarrierDto> paginatedData;

                if (request.IsFromExport)
                {
                    var OrganizationCarrierDtos = organizations.ApplyOrderByFunctions(request.GetOrderByFunction()).ProjectToType<OrganizationCarrierDto>().ToList();
                    paginatedData = new OrdinalPaginatedList<OrganizationCarrierDto>(OrganizationCarrierDtos, OrganizationCarrierDtos.Count, request.PageNumber, request.PageSize);
                }

                else
                {
                    paginatedData = await organizations
                    .ApplyOrderByFunctions(request.GetOrderByFunction())
                    .ProjectToType<OrganizationCarrierDto>()
                    .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
                }

                //foreach (var item in paginatedData.Items)
                //{
                //    var requestDetail = _context.Requests.AsNoTracking().Where(x => x.ContactPersonEmail == item.ContactPersonEmail).OrderByDescending(x => x.CreatedAt).FirstOrDefault();
                //    item.DateOfRegistration = requestDetail?.CreatedAt;
                //}


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
}
