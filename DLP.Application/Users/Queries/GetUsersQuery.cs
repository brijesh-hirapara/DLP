using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.QueryInterceptors;
using DLP.Application.Common.Sorting;
using DLP.Application.Users.DTO;
using DLP.Application.Users.Enums;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Xml.Linq;

namespace DLP.Application.Users.Queries;

public class GetUsersQuery : IOrderingQuery<User>, IRequest<OrdinalPaginatedList<UserDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string RoleId { get; set; }
    public string Search { get; set; }
    public UserFilterType FilterType { get; set; }
    public bool IsFromExport { get; set; } = false;

    // Sorting

    private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

    private static readonly IReadOnlyDictionary<string, Expression<Func<User, object?>>> OrderingPropertyMappings =
        new Dictionary<string, Expression<Func<User, object?>>>(StringComparer)
        {
            { "user", x => x.FirstName + " " + x.LastName },
            { "email", x => x.Email },
            { "joinDate", x => x.CreatedAt },
        };

    private static readonly OrderByFunction<User> DefaultOrdering = new(x => x.CreatedAt, true);

    private static IReadOnlySet<string>? PropertyKeys { get; set; }

    //Sorting

    public SortingBy? Sorting { get; set; }
    public OrderByFunction<User> GetDefaultOrdering() => DefaultOrdering;
    public IReadOnlyDictionary<string, Expression<Func<User, object?>>> GetOrderingPropertyMappings() => OrderingPropertyMappings;
    public IReadOnlySet<string> GetPropertyKeys()
    {
        PropertyKeys ??= OrderingPropertyMappings.Keys.ToHashSet(StringComparer);
        return PropertyKeys;
    }
    // end Sorting
}

public class GetUsersWithPaginationHandler : IRequestHandler<GetUsersQuery, OrdinalPaginatedList<UserDto>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IActivityLogger _activityLogger;

    public GetUsersWithPaginationHandler(IAppDbContext context, ICurrentUserService currentUserService, IActivityLogger activityLogger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _activityLogger = activityLogger;
    }

    public async Task<OrdinalPaginatedList<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var isAdmin = _currentUserService.AccessLevel == AccessLevelType.SuperAdministrator;
            var users = _context.Users
                .Where(x => isAdmin || !x.IsCertifiedTechnician)
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .IgnoreQueryFilters()
                .Where(GetInterceptor(_currentUserService.AccessLevel, _currentUserService.OrganizationId))
                .Where(IsNotSystemUser())
                .AsQueryable();

            if (!string.IsNullOrEmpty(request.Search))
            {
                string search = request.Search.Replace(" ", "");

                users = users.Where(u => (u.FirstName + u.LastName).Replace(" ", "").Contains(search)
                                    || u.Email.Contains(search)
                                    || u.PhoneNumber.Contains(search));
            }

            if (!string.IsNullOrEmpty(request.RoleId))
            {
                users = users.Where(u => u.UserRoles.Any(ur => ur.RoleId == request.RoleId));
            }

            users = users.Where(u => u.AccessLevel <= _currentUserService.AccessLevel);

            switch (request.FilterType)
            {
                case UserFilterType.ACTIVE:
                    users = users.FilterActiveUsers();
                    break;
                case UserFilterType.DISABLED:
                    users = users.Where(u => !u.IsActive && !u.IsDeleted && !u.MustChangePassword);
                    break;
                case UserFilterType.DELETED:
                    users = users.Where(u => u.IsDeleted == true && !u.MustChangePassword && !u.IsActive);
                    break;
                case UserFilterType.PENDING:
                    users = users.Where(u => u.MustChangePassword && !u.IsActive);
                    break;
                default:
                    break;
            }

            OrdinalPaginatedList<UserDto> paginatedData;

            if (request.IsFromExport)
            {
                var orderedUsers = users
                    .ApplyOrderByFunctions(request.GetOrderByFunction())
                    .ToList();

                var userDtos = orderedUsers
                  .Select((u, index) => new UserDto
                  {
                      Id = u.Id,
                      FirstName = u.FirstName,
                      LastName = u.LastName,
                      PlaceOfBirth = u.PlaceOfBirth,
                      Email = u.Email,
                      RoleName = string.Join(", ", u.UserRoles.Select(ur => ur.Role.Name)),
                      LanguageId = u.LanguageId,
                      PhoneNumber = u.PhoneNumber,
                      Comments = u.Comments,
                      CreatedAt = u.CreatedAt,
                      IsDeleted = u.IsDeleted,
                      IsAdmin = u.AccessLevel == AccessLevelType.SuperAdministrator,
                      IsActive = u.IsActive,
                      IsPending = u.MustChangePassword,
                      MunicipalityId = u.MunicipalityId,
                      OrganizationId = u.OrganizationId
                  })
                  .ToList();

                paginatedData = new OrdinalPaginatedList<UserDto>(userDtos, userDtos.Count, request.PageNumber, request.PageSize);
            }
            else
            {
                var orderedUsers = users
             .ApplyOrderByFunctions(request.GetOrderByFunction()).ToList();

                var userDtos = orderedUsers.Select((u, index) => new UserDto
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    PlaceOfBirth = u.PlaceOfBirth,
                    Email = u.Email,
                    RoleName = string.Join(", ", u.UserRoles.Select(ur => ur.Role.Name)),
                    LanguageId = u.LanguageId,
                    PhoneNumber = u.PhoneNumber,
                    Comments = u.Comments,
                    CreatedAt = u.CreatedAt,
                    IsDeleted = u.IsDeleted,
                    IsAdmin = u.AccessLevel == AccessLevelType.SuperAdministrator,
                    IsActive = u.IsActive,
                    IsPending = u.MustChangePassword,
                    MunicipalityId = u.MunicipalityId,
                    OrganizationId = u.OrganizationId
                })
                              .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
                paginatedData = userDtos;
            }
            //var data = await users
            //.ApplyOrderByFunctions(request.GetOrderByFunction())
            //.Select(u => new UserDto
            //{
            //    Id = u.Id,
            //    FirstName = u.FirstName,
            //    LastName = u.LastName,
            //    PlaceOfBirth = u.PlaceOfBirth,
            //    Email = u.Email,
            //    RoleName = string.Join(", ", u.UserRoles.Select(ur => ur.Role.Name)),
            //    LanguageId = u.LanguageId,
            //    PhoneNumber = u.PhoneNumber,
            //    Comments = u.Comments,
            //    CreatedAt = u.CreatedAt,
            //    IsDeleted = u.IsDeleted,
            //    IsAdmin = u.AccessLevel == AccessLevelType.SuperAdministrator,
            //    IsActive = u.IsActive,
            //    IsPending = u.MustChangePassword,
            //    MunicipalityId = u.MunicipalityId,
            //    OrganizationId = u.OrganizationId
            //})
            //.OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);

            // Publish the MergeDataEvent after handling the request
            //CHANGE TO POSTPROCESS PIPELINE....
            //await _mediator.Publish(new MergeDataEvent<OrdinalPaginatedList<User>> { ResponseData = users }, cancellationToken);

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved user information with pagination"
            });

            return paginatedData;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to retrieve user information with pagination", _currentUserService.UserId);
            throw;
        }
    }

    public static Expression<Func<User, bool>> GetInterceptor(AccessLevelType? providedAccessLevel, Guid? myOrganizationId)
    {
        return providedAccessLevel == AccessLevelType.SuperAdministrator ?
               e => true :
               e => e.OrganizationId == myOrganizationId;
    }

    public static Expression<Func<User, bool>> IsNotSystemUser()
    {
        return u => u.Id != SystemConstants.SystemUserId;
    }
}