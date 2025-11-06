using System.Linq.Expressions;

namespace DLP.Application.Common.Sorting;

public class OrderByFunction<T>
{
    public bool Descending { get; private set; }
    public Expression<Func<T, object?>> Selector { get; private set; }

    public OrderByFunction(Expression<Func<T, object?>> selector, bool descending)
    {
        Selector = selector;
        Descending = descending;
    }
}