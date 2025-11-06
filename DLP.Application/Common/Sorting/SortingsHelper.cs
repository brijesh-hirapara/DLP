using DLP.Application.Common.Exceptions;

namespace DLP.Application.Common.Sorting;

public static class SortingsHelper
{
    public static IReadOnlyCollection<SortingBy> ParseSortings(string? query, char separator = ',', char descensionSign = '-')
    {
        if (query == null)
        {
            return Array.Empty<SortingBy>();
        }

        var keys = query.Split(separator);
        var sortings = keys.Where(x => x.Length > 0)
            .Select(x =>
            {
                bool isDesending = x.StartsWith(descensionSign);
                return new SortingBy(isDesending ? x[1..] : x, isDesending);
            }).ToArray();

        return sortings;
    }

    public static void ValidateSortings(ISortingContainer sortingContainer)
    {
        if (sortingContainer.Sorting != null)
        {
            var propertyKeys = sortingContainer.GetPropertyKeys();

            var unknownKey = !propertyKeys.Contains(sortingContainer.Sorting.PropertyName);
            if (unknownKey != null)
            {
                throw new InvalidSortingQueryStringException(propertyKeys);
            }
        }
    }
}