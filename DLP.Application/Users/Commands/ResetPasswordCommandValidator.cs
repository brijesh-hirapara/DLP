using FluentValidation;

namespace DLP.Application.Users.Commands;

public class ResetPasswordCommandValidator : AbstractValidator<SetNewPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(v => v.UserName).NotEmpty().NotNull().WithMessage("Username is required.");
        RuleFor(v => v.CurrentPassword).NotNull().NotEmpty().WithMessage("Current Password is required.");
        RuleFor(v => v.Password).NotNull().NotEmpty().WithMessage("Password is required.");
        RuleFor(v => v.ConfirmPassword).NotNull().NotEmpty().WithMessage("Password is required.");
        RuleFor(v => v.Password).Equal(v => v.ConfirmPassword).WithMessage("The password and confirmation password must match.");
    }
}
