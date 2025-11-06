using FluentValidation;

namespace DLP.Application.Authentication.RefreshToken;
public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(v => v.AccessToken).NotEmpty().NotNull().WithMessage("AccessToken is invalid.");
    }
}