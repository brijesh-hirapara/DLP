using DLP.Application.ActivityLogs.Dto;
using DLP.Application.CertifiedTechnicians.DTO;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace DLP.Application.CertifiedTechnicians.Queries;

public class GetMyTechniciansQuery : IOrderingQuery<User>, IRequest<OrdinalPaginatedList<CertifiedTechnicianDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string Search { get; set; }


    private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

    private static readonly IReadOnlyDictionary<string, Expression<Func<User, object?>>> OrderingPropertyMappings =
        new Dictionary<string, Expression<Func<User, object?>>>(StringComparer)
        {
            { "user", x => x.FirstName + " " + x.LastName },
            { "email", x => x.Email },
            { "municipality", x=> x.Municipality.Name },
            { "trainingCenter", x=> x.Organization.Name },
            { "currentQualification",
                x => x.Qualifications
                    .OrderByDescending(x => x.CreatedAt)
                    .FirstOrDefault()
                    .QualificationType
                    .Name
            },
        };

    private static readonly OrderByFunction<User> DefaultOrdering = new(x => x.CreatedAt, true);

    private static IReadOnlySet<string>? PropertyKeys { get; set; }

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

public class GetMyTechniciansQueryQueryHandler : IRequestHandler<GetMyTechniciansQuery, OrdinalPaginatedList<CertifiedTechnicianDto>>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _logger; // Inject the IActivityLogger
    private readonly ICurrentUserService _currentUserService;

    public GetMyTechniciansQueryQueryHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUserService)
    {
        _context = context;
        _logger = logger; // Inject the IActivityLogger
        _currentUserService = currentUserService;
    }

    public async Task<OrdinalPaginatedList<CertifiedTechnicianDto>> Handle(GetMyTechniciansQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var organizationId = _currentUserService.OrganizationId;
            var users = _context.Users
                .Include(x => x.Municipality)
                .Include(x => x.Organization)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(x => x.Qualifications)
                    .ThenInclude(x => x.QualificationType)
                .Where(GetInterceptor(_currentUserService.AccessLevel, organizationId))
                .Where(x => x.EmploymentHistory.Any(z => !z.EndDate.HasValue))
                .AsQueryable();

            if (!string.IsNullOrEmpty(request.Search))
            {
                string search = request.Search.Replace(" ", "").ToLower();

                users = users.Where(u => (u.FirstName + u.LastName).Replace(" ", "").ToLower().Contains(search)
                                    || u.Email.ToLower().Contains(search)
                                    || u.PlaceOfBirth.ToLower().Contains(search)
                                    || u.Municipality.Name.ToLower().Contains(search)
                                    || u.Organization.Name.ToLower().Contains(search)
                                    || u.Qualifications.Any(x => x.QualificationType.Name.ToLower().Contains(search))
                                    || u.PhoneNumber.Contains(search));
            }

            var data = (await users
                .Where(x => x.IsCertifiedTechnician)    
                .ApplyOrderByFunctions(request.GetOrderByFunction())
                .ToListAsync())
                .Select(u => new CertifiedTechnicianDto
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    PlaceOfBirth = u.PlaceOfBirth,
                    Email = u.Email,
                    LanguageId = u.LanguageId,
                    CreatedAt = u.CreatedAt,
                    IsDeleted = u.IsDeleted,
                    IsActive = u.IsActive,
                    RoleName = string.Join(", ", u.UserRoles.Select(ur => ur.Role?.Name).Distinct()),
                    CurrentQualification = u.Qualifications.OrderByDescending(x => x.CreatedAt).FirstOrDefault()?.QualificationType?.Name,
                    CertificateNumber = u.Qualifications.OrderByDescending(x => x.CreatedAt).FirstOrDefault()?.CertificateNumber,
                    Municipality = u.Municipality.Name,
                    TrainingCenter = u.Organization?.Name,
                    IsPending = u.MustChangePassword,
                    IsCertifiedTechnician = u.IsCertifiedTechnician,
                    MunicipalityId = u.MunicipalityId.Value ,
                    OrganizationId = u.OrganizationId
                })
                .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);

            await _logger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved certified technicians"
            });

            return data;
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to retrieve certified technicians", _currentUserService.UserId);
            throw;
        }
    }

    public static Expression<Func<User, bool>> GetInterceptor(AccessLevelType? providedAccessLevel, Guid? myOrganizationId, bool considerSuperAdmin = true)
    {
        return (considerSuperAdmin && providedAccessLevel == AccessLevelType.SuperAdministrator) ?
               e => true :
               e => e.OrganizationId == myOrganizationId;
    }
}
