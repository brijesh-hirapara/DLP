using DLP.Domain.Enums;
using System.Linq.Expressions;

namespace DLP.Application.Common.QueryInterceptors;
public static class ExpressionUtils
{
    public static Expression ReplaceParameter(Expression expression, ParameterExpression targetParameter, Expression replacement)
    {
        return new ParameterReplacer(targetParameter, replacement).Visit(expression);
    }

    private class ParameterReplacer : ExpressionVisitor
    {
        private readonly ParameterExpression _targetParameter;
        private readonly Expression _replacement;

        public ParameterReplacer(ParameterExpression targetParameter, Expression replacement)
        {
            _targetParameter = targetParameter ?? throw new ArgumentNullException(nameof(targetParameter));
            _replacement = replacement ?? throw new ArgumentNullException(nameof(replacement));
        }

        protected override Expression VisitParameter(ParameterExpression node)
        {
            return node == _targetParameter ? _replacement : base.VisitParameter(node);
        }
    }
}
