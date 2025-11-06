using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Common.Pagination;

public class PaginatedList<T> : PaginatedListBase<T>
{
    public PaginatedList(List<T> items, int count, int pageIndex, int pageSize)
        : base(items, count, pageIndex, pageSize)
    { }

    public static async Task<PaginatedList<T>> CreateAsync(IQueryable<T> source, int pageIndex, int pageSize)
    {
        var count = await source.CountAsync();
        var items = pageSize != -1 ? await source.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync() : await source.ToListAsync();
        return new PaginatedList<T>(items, count, pageIndex, pageSize);
    }

    public static PaginatedList<T> CreateAsync(IEnumerable<T> source, int pageIndex, int pageSize)
    {
        var count = source.Count();
        var items = pageSize != -1 ? source.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToList() : source.ToList();
        return new PaginatedList<T>(items, count, pageIndex, pageSize);
    }
}
