using DLP.Application.Common.Sorting;
using DLP.Domain.Entities;
using System.Linq.Expressions;

namespace DLP.Application.Common.Extensions;

public static class QueryExtensions
{
    public static IQueryable<TUser> FilterActiveUsers<TUser>(this IQueryable<TUser> source) where TUser : User
    {
        return source.Where(u => u.IsActive && !u.IsDeleted && !u.MustChangePassword);
    }

    /// <summary>
    /// Orders IQueryable by multiple properties,
    /// using selectors from <paramref name="orderByFunction"/>.
    /// Ordering is applied in correspondence with the order of the selectors.
    /// </summary>
    /// <typeparam name="TSource"></typeparam>
    /// <param name="source"></param>
    /// <param name="orderByFunction">
    /// Specifies selectors and direction to order <paramref name="source"/>.
    /// </param>
    /// <exception cref="ArgumentException">Thrown when <paramref name="orderByFunction"/> is empty.</exception>
    /// <returns>IOrderedQueryable, OrderedBy first selector and ThenBy others</returns>
    public static IOrderedQueryable<TSource> ApplyOrderByFunctions<TSource>
        (this IQueryable<TSource> source,
         OrderByFunction<TSource> orderByFunction)
    {
        if (orderByFunction == null)
        {
            throw new ArgumentException("OrderByFunction argument can't be empty");
        }

        var orderedSource = source.OrderByWithDirection(orderByFunction.Selector, orderByFunction.Descending);
        return orderedSource;
    }

    private static IOrderedQueryable<TSource> OrderByWithDirection<TSource, TKey>
        (this IQueryable<TSource> source,
         Expression<Func<TSource, TKey>> keySelector,
         bool descending)
    {
        return descending ? source.OrderByDescending(keySelector)
                          : source.OrderBy(keySelector);
    }

    private static IOrderedQueryable<TSource> ThenByWithDirection<TSource, TKey>
        (this IOrderedQueryable<TSource> source,
         Expression<Func<TSource, TKey>> keySelector,
         bool descending)
    {
        return descending ? source.ThenByDescending(keySelector)
                          : source.ThenBy(keySelector);
    }
}