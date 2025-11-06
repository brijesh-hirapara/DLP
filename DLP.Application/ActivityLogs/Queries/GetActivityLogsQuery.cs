using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Domain.Entities;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace DLP.Application.ActivityLogs.Queries;

public class GetActivityLogsQuery : IOrderingQuery<ActivityLog>, IRequest<OrdinalPaginatedList<ActivityLogDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string SortBy { get; set; }
    public string SortType { get; set; }
    public string FullName { get; set; }
    public string IP { get; set; }
    public int LogType { get; set; }
    public string Activity { get; set; }
    public bool IsFromExport { get; set; } = false;

    // Sorting

    public SortingBy? Sorting { get; set; }
    private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

    private static readonly IReadOnlyDictionary<string, Expression<Func<ActivityLog, object?>>> OrderingPropertyMappings =
        new Dictionary<string, Expression<Func<ActivityLog, object?>>>(StringComparer)
        {
            { "user", x => x.User.FirstName + " " + x.User.LastName },
            { "ip", x => x.IP },
            { "date", x => x.Date },
            { "logtype", x => x.LogType },
            { "activity", x => x.Activity },
        };

    private static readonly OrderByFunction<ActivityLog> DefaultOrdering = new(x => x.Date, true);
    private static IReadOnlySet<string>? PropertyKeys { get; set; }
    public OrderByFunction<ActivityLog> GetDefaultOrdering() => DefaultOrdering;
    public IReadOnlyDictionary<string, Expression<Func<ActivityLog, object?>>> GetOrderingPropertyMappings() => OrderingPropertyMappings;
    public IReadOnlySet<string> GetPropertyKeys()
    {
        PropertyKeys ??= OrderingPropertyMappings.Keys.ToHashSet(StringComparer);
        return PropertyKeys;
    }

    // end Sorting
}

public class GetActivityLogsQueryHandler : IRequestHandler<GetActivityLogsQuery, OrdinalPaginatedList<ActivityLogDto>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public GetActivityLogsQueryHandler(IAppDbContext context, ICurrentUserService currentUserService, IIdentityService identityService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
    }

    public async Task<OrdinalPaginatedList<ActivityLogDto>> Handle(GetActivityLogsQuery request, CancellationToken cancellationToken)
    {
        var interceptor = await (new GetActivityLogsQueryInterceptor(_identityService, _currentUserService)).Get();
        var loweredFullName = request.FullName?.ToLower().Trim();
        var deletedUser = _context.Users.Where(x => x.IsDeleted).Select(x => x.Id).ToList();
        var activityLogs = _context.ActivityLogs.Where(i => !deletedUser.Contains(i.UserId))
            .Include(i => i.User)            
            .Where(interceptor)
            .Where(FullNamePredicate(loweredFullName))
            .Where(IPAddressPredicate(request.IP))
            .Where(LogTypePredicate(request.LogType))
            .Where(ActivityPredicate(request.Activity))
            .ApplyOrderByFunctions(request.GetOrderByFunction())
            .ProjectToType<ActivityLogDto>();

        if (request.IsFromExport)
        {
            var responseData = activityLogs.ToList();
            var paginatedData = new OrdinalPaginatedList<ActivityLogDto>(responseData, responseData.Count, request.PageNumber, request.PageSize);
            return paginatedData;
        }


        var paginatedResult = await activityLogs.OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);

        return paginatedResult;
    }

    private static Expression<Func<ActivityLog, bool>> FullNamePredicate(string? loweredFullName)
    {
        return activity =>
            string.IsNullOrEmpty(loweredFullName) ||
            activity.User.FirstName.ToLower().Trim().Contains(loweredFullName) ||
            activity.User.LastName.ToLower().Trim().Contains(loweredFullName);
    }

    private static Expression<Func<ActivityLog, bool>> IPAddressPredicate(string ipAddress)
    {
        return activity => string.IsNullOrEmpty(ipAddress) || activity.IP.Contains(ipAddress);
    }

    private static Expression<Func<ActivityLog, bool>> LogTypePredicate(int logType)
    {
        return activity => logType == 0 || activity.LogType == logType;
    }

    private static Expression<Func<ActivityLog, bool>> ActivityPredicate(string activityText)
    {
        return activity => string.IsNullOrEmpty(activityText) || activity.Activity.Contains(activityText);
    }
}
