using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DLP.Application.Common.Pagination;
using Microsoft.EntityFrameworkCore;
using Mapster;

namespace DLP.Application.Common.Mappings;
public static class MappingExtensions
{
    // Regular PaginatedList
    public static Task<PaginatedList<TDestination>> PaginatedListAsync<TDestination>(this IQueryable<TDestination> queryable, int pageNumber, int pageSize)
        => PaginatedList<TDestination>.CreateAsync(queryable, pageNumber, pageSize);

    public static PaginatedList<TDestination> PaginatedListAsync<TDestination>(this IEnumerable<TDestination> list, int pageNumber, int pageSize)
        => PaginatedList<TDestination>.CreateAsync(list, pageNumber, pageSize);

    // Ordinal PaginatedList
    public static Task<OrdinalPaginatedList<TDestination>> OrdinalPaginatedListAsync<TDestination>(this IQueryable<TDestination> queryable, int pageNumber, int pageSize)
        where TDestination : IOrdinalNumber
        => OrdinalPaginatedList<TDestination>.CreateAsync(queryable, pageNumber, pageSize);

    public static OrdinalPaginatedList<TDestination> OrdinalPaginatedListAsync<TDestination>(this IEnumerable<TDestination> list, int pageNumber, int pageSize)
        where TDestination : IOrdinalNumber
        => OrdinalPaginatedList<TDestination>.CreateAsync(list, pageNumber, pageSize);

    public static Task<List<TDestination>> ProjectToListAsync<TDestination>(this IQueryable queryable)
        => queryable.ProjectToType<TDestination>(TypeAdapterConfig.GlobalSettings).ToListAsync();
}

