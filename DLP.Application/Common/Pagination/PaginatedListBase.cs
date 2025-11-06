namespace DLP.Application.Common.Pagination;
public abstract class PaginatedListBase<T>
{
    public List<T> Items { get; protected set; }
    public int PageIndex { get; protected set; }
    public int TotalPages { get; protected set; }
    public int TotalCount { get; protected set; }
    public int PageSize { get; protected set; }

    protected PaginatedListBase(List<T> items, int count, int pageIndex, int pageSize)
    {
        PageIndex = pageIndex;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        TotalCount = count;
        Items = items;
        PageSize = pageSize;
    }

    public bool HasPreviousPage => PageIndex > 1;
    public bool HasNextPage => PageIndex < TotalPages;
}