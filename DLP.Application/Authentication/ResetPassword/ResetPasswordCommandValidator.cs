using FluentValidation;
using DLP.Application.Common.Extensions;

namespace DLP.Application.Authentication.ResetPassword;
public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(v => v.Email)
            .EmailAddress().NotEmpty().NotNull().WithMessage("Email is required.");
        RuleFor(x => x.Password).Password();
        RuleFor(v => v.Code).NotEmpty().NotNull().WithMessage("Code for reseting password is required.");
    }
}