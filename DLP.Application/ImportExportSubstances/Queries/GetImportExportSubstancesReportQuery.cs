using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Application.ImportExportSubstances.DTOs;
using DLP.Application.ServiceTechnician.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using System.Linq.Expressions;

namespace DLP.Application.ImportExportSubstances.Queries
{
    public class GetImportExportSubstancesReportQuery :IOrderingQuery<ImportExportSubstancesReport>, IRequest<OrdinalPaginatedList<ImportExportSubstancesReportDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        //public string SortBy { get; set; }
        //public string SortType { get; set; }
        public string Search { get; set; }

        private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

        private static readonly IReadOnlyDictionary<string, Expression<Func<ImportExportSubstancesReport, object?>>> OrderingPropertyMappings =
            new Dictionary<string, Expression<Func<ImportExportSubstancesReport, object?>>>(StringComparer)
            {
            { "year", x => x.Year },
            { "submitedDate", x => x.SubmitedDate },
            { "responsiblePerson", x => x.ResponsiblePerson },
            { "organizationName", x => x.Organization },

            };


        private static readonly OrderByFunction<ImportExportSubstancesReport> DefaultOrdering = new(x => x.Year, true);

        //Sorting
        private static IReadOnlySet<string>? PropertyKeys { get; set; }
        public SortingBy? Sorting { get; set; }
        public OrderByFunction<ImportExportSubstancesReport> GetDefaultOrdering() => DefaultOrdering;
        public IReadOnlyDictionary<string, Expression<Func<ImportExportSubstancesReport, object?>>> GetOrderingPropertyMappings() => OrderingPropertyMappings;
        public IReadOnlySet<string> GetPropertyKeys()
        {
            PropertyKeys ??= OrderingPropertyMappings.Keys.ToHashSet(StringComparer);
            return PropertyKeys;
        }
    }

    public class GetImportExportSubstancesReportQueryHandler : IRequestHandler<GetImportExportSubstancesReportQuery, OrdinalPaginatedList<ImportExportSubstancesReportDto>>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public GetImportExportSubstancesReportQueryHandler(IAppDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<OrdinalPaginatedList<ImportExportSubstancesReportDto>> Handle(GetImportExportSubstancesReportQuery request, CancellationToken cancellationToken)
        {
            var search = request.Search;
            var isAdmin = _currentUserService.AccessLevel == AccessLevelType.SuperAdministrator;
            var importExportSubstancesReportQuery = _context.ImportExportSubstancesReport
                        .Where(m => !m.IsDeleted &&
                            (string.IsNullOrEmpty(search)
                                || search.Contains(m.Year.ToString().ToLower().Trim())
                            ));
            if (!isAdmin)
            {
                importExportSubstancesReportQuery = importExportSubstancesReportQuery.Where(m => m.OrganizationId == _currentUserService.OrganizationId);
            }

            //var importExportSubstancesReport = await importExportSubstancesReportQuery
            //            .OrderBy(x => x.CreatedAt)
            //            .ProjectToType<ImportExportSubstancesReportDto>()
            //            .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);

            var importExportSubstancesReport = await importExportSubstancesReportQuery
               .ApplyOrderByFunctions(request.GetOrderByFunction())
               .ProjectToType<ImportExportSubstancesReportDto>()
               .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);

            return importExportSubstancesReport;
        }
    }
}

