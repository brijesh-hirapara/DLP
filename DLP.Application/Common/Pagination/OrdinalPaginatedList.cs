using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Common.Pagination;

public class OrdinalPaginatedList<T> : PaginatedListBase<T> where T : IOrdinalNumber
{
    public OrdinalPaginatedList(List<T> items, int count, int pageIndex, int pageSize)
        : base(items, count, pageIndex, pageSize)
    {
        AssignOrdinalNumbers();
    }

    private void AssignOrdinalNumbers()
    {
        //int ordinalNumberBase = (PageIndex - 1) * Items.Count;
        //for (int i = 0; i < Items?.Count; i++)
        //{
        //    Items[i].OrdinalNumber = ordinalNumberBase + i + 1;
        //}

        int ordinalNumberBase = (PageIndex - 1) * PageSize;
        for (int i = 0; i < Items?.Count; i++)
        {
            Items[i].OrdinalNumber = ordinalNumberBase + i + 1;
        }
    }

    public static async Task<OrdinalPaginatedList<T>> CreateAsync(IQueryable<T> source, int pageIndex, int pageSize)
    {
        var count = await source.CountAsync();
        var items = (pageSize != -1
            ? await source.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync()
            : await source.ToListAsync()) ?? new();
        return new OrdinalPaginatedList<T>(items, count, pageIndex, pageSize);
    }

    public static OrdinalPaginatedList<T> CreateAsync(IEnumerable<T> source, int pageIndex, int pageSize)
    {
        var count = source.Count();
        var items = pageSize != -1 ? source.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToList() : source.ToList();
        return new OrdinalPaginatedList<T>(items, count, pageIndex, pageSize);
    }
}