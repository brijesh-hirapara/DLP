using DLP.Application.Common.Constants;
using DLP.Domain.Common;
using DLP.Domain.Enums;
using LinqKit;
using System.Linq.Expressions;

namespace DLP.Application.Common.QueryInterceptors;
public static class QueryInterceptors
{
    public static Expression<Func<T, bool>> GenerateEntityAccessLevelsQueryExpression<T>(
    Expression<Func<T, IHasStateEntityId>> propertySelector,
    List<AccessLevelType> providedAccessLevels)
    {
        var accessLevelsPredicate = PredicateBuilder.New<T>(false);

        foreach (var accessLevel in providedAccessLevels)
        {
            Expression<Func<T, bool>> accessLevelCondition = null;

            //switch (accessLevel)
            //{
            //    case AccessLevelType.EntityFBih:
            //        accessLevelCondition = GenerateAccessExpression(propertySelector, prop => prop.StateEntityId == EntityConstants.FBiH);
            //        break;
            //    case AccessLevelType.EntitySprska:
            //        accessLevelCondition = GenerateAccessExpression(propertySelector, prop => prop.StateEntityId == EntityConstants.Srpska);
            //        break;
            //    case AccessLevelType.EntityBrcko:
            //        accessLevelCondition = GenerateAccessExpression(propertySelector, prop => prop.StateEntityId == EntityConstants.Brcko);
            //        break;
            //}

            accessLevelsPredicate = accessLevelsPredicate.Or(accessLevelCondition);
        }

        return accessLevelsPredicate;
    }

    private static Expression<Func<T, bool>> GenerateAccessExpression<T>(
        Expression<Func<T, IHasStateEntityId>> propertySelector,
        Expression<Func<IHasStateEntityId, bool>> condition)
    {
        var entityParam = Expression.Parameter(typeof(T), "e");
        var prop = ExpressionUtils.ReplaceParameter(propertySelector.Body, propertySelector.Parameters[0], entityParam);
        var body = ExpressionUtils.ReplaceParameter(condition.Body, condition.Parameters[0], prop);
        return Expression.Lambda<Func<T, bool>>(body, entityParam);
    }
}
