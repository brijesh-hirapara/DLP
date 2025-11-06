
using FluentValidation;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace DLP.Application.UserGroups.Commands;

public class AddUserGroupCommandValidator : AbstractValidator<AddUserGroupCommand>
{
    private readonly RoleManager<Role> _roleManager;

    public AddUserGroupCommandValidator(RoleManager<Role> roleManager)
    {
        _roleManager = roleManager;

        RuleFor(command => command.Name)
            .NotEmpty().WithMessage("User Group name is required.")
            .MustAsync(BeUniqueGroupName).WithMessage("A User Group with the same name already exists.");

        RuleFor(v => v.Permissions)
            .Must(permissions => permissions.Any(p => p.Checked && !string.IsNullOrEmpty(p.Name)))
            .WithMessage("At least one permission must have a name and be checked/assigned.");
    }

    private async Task<bool> BeUniqueGroupName(string name, CancellationToken cancellationToken)
    {
        var roleAlreadyExists = await _roleManager.RoleExistsAsync(name);
        return !roleAlreadyExists;
    }

    private bool ContainValidPermissions(List<UserGroupPermission> permissions)
    {
        return permissions.Any(p => p.Checked && !string.IsNullOrEmpty(p.Name));
    }
}
