using FluentValidation;

namespace DLP.Application.Authentication.Login
{
    public class LoginCommandValidator : AbstractValidator<LoginCommand>
    {
        public LoginCommandValidator()
        {
            RuleFor(v => v.Email).EmailAddress().NotEmpty().NotNull().WithMessage("Email is required.");
            RuleFor(v => v.Password).NotNull().NotEmpty().WithMessage("Password is required.");
            // RuleFor(v => v.FcmToken).NotNull().NotEmpty().WithMessage("FcmToken is required.");
        }
    }
}
