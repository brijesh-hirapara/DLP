using FluentValidation;
using DLP.Application.Common.Extensions;
using DLP.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace DLP.Application.Authentication.Register
{
    public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
    {
        private readonly UserManager<User> _userManager;
        public RegisterCommandValidator(UserManager<User> userManager)
        {
            _userManager = userManager;

            RuleFor(x => x.Email)
                .NotEmpty().NotNull().EmailAddress().WithMessage("Email is required")
                .MustAsync(BeUniqueEmail).WithMessage("This email already exists!");
            RuleFor(x => x.Password).Password();
            RuleFor(x => x.FirstName).NotEmpty().NotNull().WithMessage("First Name is required");
            RuleFor(x => x.LastName).NotEmpty().NotNull().WithMessage("Last Name is required");
        }

        public async Task<bool> BeUniqueEmail(string email, CancellationToken cancellationToken)
        {
            var userByEmail = await _userManager.FindByEmailAsync(email);
            return userByEmail == null;
        }
    }
}
