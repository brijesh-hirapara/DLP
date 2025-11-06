using FluentValidation;
using DLP.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Authentication.Profile.Commands;

public class UpdateUserProfileCommandValidator : AbstractValidator<UpdateUserProfileCommand>
{
    private readonly UserManager<User> _userManager;
    public UpdateUserProfileCommandValidator(UserManager<User> userManager)
    {
        _userManager = userManager;

        RuleFor(x => x.Email)
            .NotEmpty().NotNull().EmailAddress().WithMessage("Email is required")
            .MustAsync((user, email, cancellationToken) => BeUniqueEmail(user.UserId, email, cancellationToken)).WithMessage("This email already exists");
        RuleFor(x => x.FirstName).NotEmpty().NotNull().WithMessage("First Name is required");
        RuleFor(x => x.LastName).NotEmpty().NotNull().WithMessage("Last Name is required");
    }

    public async Task<bool> BeUniqueEmail(string userId, string email, CancellationToken cancellationToken)
    {
        var userByEmail = await _userManager.Users.FirstOrDefaultAsync(x => x.Id != userId && x.Email == email, cancellationToken);
        return userByEmail == null;
    }
}