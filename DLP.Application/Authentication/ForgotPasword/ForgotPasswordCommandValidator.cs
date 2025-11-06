using FluentValidation;

namespace DLP.Application.Authentication.ForgotPassword;
public class ForgotPasswordValidator : AbstractValidator<ForgotPasswordCommand>
{
    public ForgotPasswordValidator()
    {
        RuleFor(v => v.Email)
            .EmailAddress().NotEmpty().NotNull().WithMessage("Email is required.");
    }
}