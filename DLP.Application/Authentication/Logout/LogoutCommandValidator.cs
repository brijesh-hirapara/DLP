using FluentValidation;

namespace DLP.Application.Authentication.Logout;

public class LogoutCommandValidator : AbstractValidator<LogoutCommand>
{
    public LogoutCommandValidator()
    {
        RuleFor(v => v.AccessToken).NotNull().NotEmpty().WithMessage("AccessToken is invalid");
    }
}