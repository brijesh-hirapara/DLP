using DLP.Domain.Enums;
using LinqKit;
using System.Linq.Expressions;

namespace DLP.Application.Common.QueryInterceptors;

public class ExpressionGenerator
{
    public static Expression<Func<T, bool>> GenerateCombinedExpression<T>(
        List<AccessLevelType> providedAccessLevels, Dictionary<AccessLevelType, Expression<Func<T, bool>>> accessLevelToExpressionMap)
    {
        var combinedPredicate = PredicateBuilder.New<T>(false);

        foreach (var key in accessLevelToExpressionMap.Keys)
        {
            if (providedAccessLevels.Contains(key))
            {
                var accessLevelPredicate = accessLevelToExpressionMap[key];
                combinedPredicate = combinedPredicate.Or(accessLevelPredicate);
            }
        }

        return combinedPredicate;
    }
}
