

using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Application.ServiceTechnician.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using System.Linq.Expressions;

namespace DLP.Application.ServiceTechnician.Queries
{
    public class GetServiceTechnicianReportQuery : IOrderingQuery<ServiceTechnicianReport>, IRequest<OrdinalPaginatedList<ServiceTechnicianReportDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        //public string SortBy { get; set; }
        //public string SortType { get; set; }
        public string Search { get; set; }
        public bool IsFromExport { get; set; } = false;

        private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

        private static readonly IReadOnlyDictionary<string, Expression<Func<ServiceTechnicianReport, object?>>> OrderingPropertyMappings =
            new Dictionary<string, Expression<Func<ServiceTechnicianReport, object?>>>(StringComparer)
            {
            { "year", x => x.Year },
            { "submitedDate", x => x.SubmitedDate },
            { "responsiblePerson", x => x.ResponsiblePerson },
            { "organizationName", x => x.Organization },

            };


        private static readonly OrderByFunction<ServiceTechnicianReport> DefaultOrdering = new(x => x.Year, true);

        //Sorting
        private static IReadOnlySet<string>? PropertyKeys { get; set; }
        public SortingBy? Sorting { get; set; }
        public OrderByFunction<ServiceTechnicianReport> GetDefaultOrdering() => DefaultOrdering;
        public IReadOnlyDictionary<string, Expression<Func<ServiceTechnicianReport, object?>>> GetOrderingPropertyMappings() => OrderingPropertyMappings;
        public IReadOnlySet<string> GetPropertyKeys()
        {
            PropertyKeys ??= OrderingPropertyMappings.Keys.ToHashSet(StringComparer);
            return PropertyKeys;
        }
    }

    public class GetServiceTechnicianReportQueryHandler : IRequestHandler<GetServiceTechnicianReportQuery, OrdinalPaginatedList<ServiceTechnicianReportDto>>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public GetServiceTechnicianReportQueryHandler(IAppDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<OrdinalPaginatedList<ServiceTechnicianReportDto>> Handle(GetServiceTechnicianReportQuery request, CancellationToken cancellationToken)
        {
            var search = request.Search;
            var isAdmin = _currentUserService.AccessLevel == AccessLevelType.SuperAdministrator;
            var serviceTechnicianReportQuery = _context.ServiceTechnicianReport
                        .Where(m => !m.IsDeleted &&
                            (string.IsNullOrEmpty(search)
                                || search.Contains(m.Year.ToString().ToLower().Trim())
                            ));
            if (!isAdmin)
            {
                serviceTechnicianReportQuery = serviceTechnicianReportQuery.Where(m => m.OrganizationId == _currentUserService.OrganizationId);
            }

            //var serviceTechnicianReport = await serviceTechnicianReportQuery
            //            .OrderBy(x => x.CreatedAt)
            //            .ProjectToType<ServiceTechnicianReportDto>()
            //            .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);

            var serviceTechnicianReport = await serviceTechnicianReportQuery
              .ApplyOrderByFunctions(request.GetOrderByFunction())
               .ProjectToType<ServiceTechnicianReportDto>()
               .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);

            return serviceTechnicianReport;
        }
    }
}

