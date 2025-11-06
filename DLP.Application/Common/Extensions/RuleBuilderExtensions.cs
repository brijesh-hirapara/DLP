using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Common.Extensions
{
    public static class RuleBuilderExtensions
    {
        public static IRuleBuilder<T, string> Password<T>(this IRuleBuilder<T, string> ruleBuilder, int minimumLength = 8)
        {
            var options = ruleBuilder
                .NotEmpty().WithMessage("Password should not be empty")
                .MinimumLength(minimumLength).WithMessage("Password should be minimum of 8 characters")
                .Matches("[A-Z]").WithMessage("Password must contains uppercase letters")
                .Matches("[a-z]").WithMessage("Password must contains lowercase letters")
                .Matches("[0-9]").WithMessage("Password must contains have digits")
                .Matches("[^a-zA-Z0-9]").WithMessage("Password must contains a special character");
            return options;
        }
    }
}
