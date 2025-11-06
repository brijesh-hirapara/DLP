namespace DLP.Application.Common.Sorting;

public interface ISortingContainer
{
    SortingBy? Sorting { get; }
    IReadOnlySet<string> GetPropertyKeys();
}
