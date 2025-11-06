using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Common.Extensions
{
    public static class ConditionalExpressionExtensions
    {
        public static IQueryable<T> If<T>(
            this IQueryable<T> source,
            bool condition,
            Func<IQueryable<T>, IQueryable<T>> transform
        )
        {
            return condition ? transform(source) : source;
        }
    }
}
