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
    public class GetCarrierListQuery : IOrderingQuery<TransportCarrier>, IRequest<OrdinalPaginatedList<TransportCarrierListDto>>
    {
        public string TransportRequestId { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string Search { get; set; }
        public bool IsFromExport { get; set; } = false;
        // Sorting

        private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

        private static readonly IReadOnlyDictionary<string, Expression<Func<TransportCarrier, object?>>> OrderingPropertyMappings =
            new Dictionary<string, Expression<Func<TransportCarrier, object?>>>(StringComparer)
            {
            { "createdAt", x => x.CreatedAt },
            { "name", x => x.Organization.Name },
            { "invitationStatus", x => x.InvitationStatus },
            };

        private static readonly OrderByFunction<TransportCarrier> DefaultOrdering = new(x => x.CreatedAt, true);

        private static IReadOnlySet<string>? PropertyKeys { get; set; }

        //Sorting

        public SortingBy? Sorting { get; set; }
        public OrderByFunction<TransportCarrier> GetDefaultOrdering() => DefaultOrdering;
        public IReadOnlyDictionary<string, Expression<Func<TransportCarrier, object?>>> GetOrderingPropertyMappings() => OrderingPropertyMappings;
        public IReadOnlySet<string> GetPropertyKeys()
        {
            PropertyKeys ??= OrderingPropertyMappings.Keys.ToHashSet(StringComparer);
            return PropertyKeys;
        }
        // end Sorting
    }


    public class GetCarrierListQueryHandler : IRequestHandler<GetCarrierListQuery, OrdinalPaginatedList<TransportCarrierListDto>>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IIdentityService _identityService;
        private readonly IActivityLogger _activityLogger;

        public GetCarrierListQueryHandler(IAppDbContext context, ICurrentUserService currentUserService, IIdentityService identityService, IActivityLogger activityLogger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _identityService = identityService;
            _activityLogger = activityLogger;
        }

        public async Task<OrdinalPaginatedList<TransportCarrierListDto>> Handle(GetCarrierListQuery request, CancellationToken cancellationToken)
        {
            try
            {

                Guid transportRequestGuid = Guid.Parse(request.TransportRequestId);

                var carriers = _context.TransportCarriers
                    .Include(x => x.TruckType)
                    .Include(x=>x.Organization)
                    .Include(x=>x.TransportRequest)
                        .ThenInclude(tr => tr.Organization)
                    .Where(x => !x.IsDeleted &&
                                x.TransportRequestId == transportRequestGuid)   // ✅ Filter added
                    .AsQueryable();


                if (!string.IsNullOrEmpty(request.Search))
                {
                    string search = request.Search.Trim().ToLower();
                    carriers = carriers.Where(x =>
                        x.Organization.Name.ToLower().Contains(search)
                    );
                }

                OrdinalPaginatedList<TransportCarrierListDto> response;

                if (request.IsFromExport)
                {
                    var list = carriers
                        .ApplyOrderByFunctions(request.GetOrderByFunction())
                        .ProjectToType<TransportCarrierListDto>()
                        .ToList();

                    response = new OrdinalPaginatedList<TransportCarrierListDto>(list, list.Count, request.PageNumber, request.PageSize);
                }
                else
                {
                    response = await carriers
                        .ApplyOrderByFunctions(request.GetOrderByFunction())
                        .ProjectToType<TransportCarrierListDto>()
                        .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
                }

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Fetched Transport Carrier List (By TransportRequestId)"
                });

                return response;

            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Failed to fetch transport carriers", _currentUserService.UserId);
                throw;
            }
        }
    }
}