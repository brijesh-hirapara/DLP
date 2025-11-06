using System.Linq.Expressions;

namespace DLP.Application.Common.Sorting;
public interface IOrderingQuery<TEntity> : ISortingContainer
{
    IReadOnlyDictionary<string, Expression<Func<TEntity, object?>>> GetOrderingPropertyMappings();
    OrderByFunction<TEntity> GetDefaultOrdering();
}
