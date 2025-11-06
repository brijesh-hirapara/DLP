using DLP.Application.Common.Exceptions;

namespace DLP.Application.Common.Sorting;

public static class OrderingQueryExtensions
{
    public static OrderByFunction<T> GetOrderByFunction<T>(
        this IOrderingQuery<T> orderingQuery)
    {
        var sorting = orderingQuery.Sorting;
        var orderByFunction = sorting == null ? null : BuildOrderFunction(orderingQuery, sorting);
        orderByFunction ??= orderingQuery.GetDefaultOrdering();
        return orderByFunction;
    }

    private static OrderByFunction<T>? BuildOrderFunction<T>(
        IOrderingQuery<T> orderingQuery,
        SortingBy sorting)
    {
        var mappings = orderingQuery.GetOrderingPropertyMappings();

        string property = sorting.PropertyName;
        if (property == null) return null;

        if (!mappings.TryGetValue(property, out var selector))
        {
            throw new OrderByFunctionBuildException(property);
        }
        OrderByFunction<T> result = new(selector, sorting.IsDescending);
        return result;
    }
}