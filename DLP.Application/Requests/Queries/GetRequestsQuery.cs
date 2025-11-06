using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Application.Requests.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace DLP.Application.Requests.Queries;

public class GetRequestsQuery : IOrderingQuery<Request>, IRequest<OrdinalPaginatedList<ListRequestDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string IdNumber { get; set; }
    public string CompanyName { get; set; }
    public RequestType? Type { get; set; }
    public RequestStatus? Status { get; set; }
    public bool ListArchived { get; set; }
    public string Search { get; set; }
    public bool IsFromExport { get; set; } = false;
    // Sorting

    private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

    private static readonly IReadOnlyDictionary<string, Expression<Func<Request, object?>>> OrderingPropertyMappings =
        new Dictionary<string, Expression<Func<Request, object?>>>(StringComparer)
        {
            { "idNumber", x => x.IdNumber},
            { "requestId", x => x.RequestId},
            { "name", x => x.CompanyName },
            { "createdAt", x => x.CreatedAt },
            //{ "municipality", x => x.Municipality.Name },
            { "requestType", x => x.Type },
            { "status", x => x.Status },
        };

    private static readonly OrderByFunction<Request> DefaultOrdering = new(x => x.CreatedAt, true);

    private static IReadOnlySet<string>? PropertyKeys { get; set; }

    //Sorting

    public SortingBy? Sorting { get; set; }
    public OrderByFunction<Request> GetDefaultOrdering() => DefaultOrdering;
    public IReadOnlyDictionary<string, Expression<Func<Request, object?>>> GetOrderingPropertyMappings() => OrderingPropertyMappings;
    public IReadOnlySet<string> GetPropertyKeys()
    {
        PropertyKeys ??= OrderingPropertyMappings.Keys.ToHashSet(StringComparer);
        return PropertyKeys;
    }
    // end Sorting
}


public class GetRequestsQueryHandler : IRequestHandler<GetRequestsQuery, OrdinalPaginatedList<ListRequestDto>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;
    private readonly IActivityLogger _activityLogger;

    public GetRequestsQueryHandler(IAppDbContext context, ICurrentUserService currentUserService, IIdentityService identityService, IActivityLogger activityLogger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
        _activityLogger = activityLogger;
    }

    public async Task<OrdinalPaginatedList<ListRequestDto>> Handle(GetRequestsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var interceptor = await (new GetRequestsQueryInterceptor(_identityService, _currentUserService)).Get();

            var requests = _context.Requests
                        .Include(x => x.Company)
                        .Include(x => x.Company.ContactPerson)
                        .Where(interceptor)
                        .AsQueryable();

            if (!request.ListArchived)
            {
                requests = requests.Where(x => x.Status == RequestStatus.Pending);
                if (request.Type.HasValue && request.Type > 0)
                {
                    requests = requests.Where(u => u.Type == request.Type);
                }
            }
            else
            {
                //requests = requests.Where(x => x.Status == RequestStatus.Pending);
                if (request.Status.HasValue && request.Status >= 0)
                {
                    requests = requests.Where(u => u.Status == request.Status);
                }
            }

            if (!string.IsNullOrEmpty(request.Search))
            {
                string search = request.Search.Replace(" ", "");
                requests = requests.Where(r => r.CompanyName.Contains(search)
                                    || r.IdNumber.Contains(search)
                                    || r.RequestId.Contains(search));
            }

          

            if (!string.IsNullOrEmpty(request.IdNumber))
            {
                string idNumber = request.IdNumber.Replace(" ", "");
                requests = requests.Where(u => u.IdNumber == idNumber);
            }

            if (!string.IsNullOrEmpty(request.CompanyName))
            {
                string companyName = request.IdNumber.Replace(" ", "");
                requests = requests.Where(u => u.CompanyName != null && u.CompanyName.Contains(companyName));
            }

            OrdinalPaginatedList<ListRequestDto> responseData;

            if (request.IsFromExport)
            {
                var response = requests
                .ApplyOrderByFunctions(request.GetOrderByFunction())
                .ProjectToType<ListRequestDto>()
                .ToList();
                responseData = new OrdinalPaginatedList<ListRequestDto>(response, response.Count, request.PageNumber, request.PageSize);
            }
            else
            {
                responseData = await requests
                      .ApplyOrderByFunctions(request.GetOrderByFunction())
                      .ProjectToType<ListRequestDto>()
                      .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
            }


            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved a list of requests",
            });



            return responseData;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "An error occurred while handling the GetRequestsQuery", _currentUserService.UserId);
            throw;
        }
    }
}
