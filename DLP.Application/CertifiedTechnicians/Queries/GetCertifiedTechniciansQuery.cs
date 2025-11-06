using DLP.Application.ActivityLogs.Dto;
using DLP.Application.CertifiedTechnicians.DTO;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Application.Requests.DTOs;
using DLP.Application.Users.Enums;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace DLP.Application.CertifiedTechnicians.Queries;

public class GetCertifiedTechniciansQuery : IOrderingQuery<User>, IRequest<OrdinalPaginatedList<CertifiedTechnicianDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string Search { get; set; }
    public Guid? EntityId { get; set; }

    public Guid? OrganizationId { get; set; }
    public Guid? MunicipalityId { get; set; }
    public UserFilterType? FilterType { get; set; } = null;
    public bool IsFromExport { get; set; } = false;


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

public class GetCertifiedTechniciansQueryHandler : IRequestHandler<GetCertifiedTechniciansQuery, OrdinalPaginatedList<CertifiedTechnicianDto>>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _logger;
    private readonly ICurrentUserService _currentUserService;

    public GetCertifiedTechniciansQueryHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUserService)
    {
        _context = context;
        _logger = logger;
        _currentUserService = currentUserService;
    }

    public async Task<OrdinalPaginatedList<CertifiedTechnicianDto>> Handle(GetCertifiedTechniciansQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var users = _context.Users
                .IgnoreQueryFilters()   
                .Include(x => x.Municipality)
                .Include(x => x.Organization)
                .Include(x => x.CreatedBy)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(x => x.Qualifications)
                    .ThenInclude(x => x.QualificationType)
                .Where(IsNotSystemUser()) // it shouldn't happen due to IsCertifiedTechnician but JIC!
                .AsQueryable();


            if (request.MunicipalityId.HasValue)
            {                
                users = users.Where(x=>x.MunicipalityId == request.MunicipalityId);
            }

            if (request.EntityId.HasValue)
            {
                users = users.Where(x => x.Municipality.StateEntityId == request.EntityId.Value);
            }

            if (request.FilterType.HasValue)
            {
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
                    case UserFilterType.MINE:
                        users = users.Where(u => u.IsCertifiedTechnician && u.OrganizationId == _currentUserService.OrganizationId);
                        break;
                    default:
                        break;
                }
            }

            if (request.OrganizationId.HasValue)
            {
                users = users.Where(x => x.OrganizationId == request.OrganizationId);
            }

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

            OrdinalPaginatedList<CertifiedTechnicianDto> responseData;
            if (request.IsFromExport)
            {
                var response = (await users
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
                    Municipality = u.Municipality?.Name,
                    TrainingCenter = u.Organization?.Name,
                    IsCreatedByMyGroup = !u.CreatedBy?.IsCertifiedTechnician == true && u.CreatedBy?.OrganizationId == _currentUserService.OrganizationId,
                    // Address = u.Address,
                    IsPending = u.MustChangePassword,
                    IsCertifiedTechnician = u.IsCertifiedTechnician,
                    MunicipalityId = u.MunicipalityId,
                    OrganizationId = u.OrganizationId
                }).ToList();
                responseData = new OrdinalPaginatedList<CertifiedTechnicianDto>(response, response.Count, request.PageNumber, request.PageSize);
            }
            else
            {
                responseData = (await users
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
               Municipality = u.Municipality?.Name,
               TrainingCenter = u.Organization?.Name,
               IsCreatedByMyGroup = !u.CreatedBy?.IsCertifiedTechnician == true && u.CreatedBy?.OrganizationId == _currentUserService.OrganizationId,
               // Address = u.Address,
               IsPending = u.MustChangePassword,
               IsCertifiedTechnician = u.IsCertifiedTechnician,
               MunicipalityId = u.MunicipalityId,
               OrganizationId = u.OrganizationId
           })
           .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
            }

               

            await _logger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved certified technicians"
            });

            return responseData;
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to get certified technicians", _currentUserService.UserId);
            throw;
        }
        
    }

    public static Expression<Func<User, bool>> IsNotSystemUser()
        {
            return u => u.Id != SystemConstants.SystemUserId;
        }
}
