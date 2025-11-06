using Hangfire;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Organizations.Notifications;
using DLP.Application.Organizations.Requests;
using DLP.Application.UserGroups.Commands;
using DLP.Application.UserGroups.DTOs;
using DLP.Application.Users.Commands;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Organizations.Commands;

public class AddOrganizationCommand : IRequest<Unit>
{
    public OrganizationRequest Organization { get; set; }
    public string CreatedById { get; set; }
}

public class AddOrganizationCommandHandler : IRequestHandler<AddOrganizationCommand, Unit>
{
    private readonly IAppDbContext _context;
    private readonly IMediator _mediator;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUserService;
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly ITranslationService _translationService;
    private readonly IBackgroundJobClient _backgroundJobClient;

    public AddOrganizationCommandHandler(
        IAppDbContext context, 
        IMediator mediator, 
        IActivityLogger activityLogger, 
        ICurrentUserService currentUserService,
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
        ITranslationService translationService,
        IBackgroundJobClient backgroundJobClient)
    {
        _context = context;
        _mediator = mediator;
        _activityLogger = activityLogger;
        _currentUserService = currentUserService;
        _userManager = userManager;
        _roleManager = roleManager;
        _translationService = translationService;
        _backgroundJobClient = backgroundJobClient;
    }

    public async Task<Unit> Handle(AddOrganizationCommand request, CancellationToken cancellationToken)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var organization = new Organization
            {
                Id = Guid.NewGuid(),
                Name = request.Organization.Name,
                IdNumber = request.Organization.IdNumber,
                TaxNumber = request.Organization.TaxNumber,
                ResponsiblePersonFullName = request.Organization.ResponsiblePersonFullName,
                ResponsiblePersonFunction = request.Organization.ResponsiblePersonFunction,
                Address = request.Organization.Address,
                Place = request.Organization.Place,
                //MunicipalityId = request.Organization.MunicipalityId,
                //StateEntityId = request.Organization.StateEntityId,
                Email = request.Organization.Email,
                PhoneNumber = request.Organization.PhoneNumber,
                WebsiteUrl = request.Organization.WebsiteUrl,
                IsDeleted = false
            };

            await _context.Organizations.AddAsync(organization, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            var languageId = _context.Languages.Include(x => x.I18nCode).FirstOrDefault(x => x.I18nCode.Code == _currentUserService.LanguageCode).Id;

            var contactPersonId = await _mediator.Send(new CreateUserCommand
            {
                OrganizationId = organization.Id,
                FirstName = request.Organization.ContactPersonFirstName,
                LastName = request.Organization.ContactPersonLastName,
                Email = request.Organization.ContactPersonEmail,
                LanguageId = languageId,
                //MunicipalityId = request.Organization.MunicipalityId,
                UserGroups = request.Organization.UserGroups
            }, cancellationToken);

            organization.ContactPersonId = contactPersonId;
            _context.Organizations.Update(organization);

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Organization added successfully."
            });


            await AssignUserGroup(contactPersonId, organization.Name, request.Organization.UserGroups, cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            await _mediator.Publish(new AddOrganizationNotification(organization.Id, organization.Type, contactPersonId), cancellationToken);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            await _activityLogger.Exception(ex.Message, "Failed to add organization", _currentUserService.UserId);
            throw; // Re-throw the caught exception to inform the caller about the failure.
        }
    }

    private async Task AssignUserGroup(string userId, string companyName, List<string> currentUserRoles, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(userId) ?? throw new Exception("Not found");
        var saTranslation = await _translationService
                    .Translate(user.LanguageId.Value, "super-admin", "Super Administrator");
        var newRole = $"{companyName} - {saTranslation}";

        var userGroupPermissions = new List<string>();
        var newRoleAccessLevel = AccessLevelType.Company;
        foreach (var role in currentUserRoles)
        {
            var companyRole = await _roleManager.FindByNameAsync(role);
            if (companyRole == null)
            {
                return;
            }

            var currentUserGroupPermissions = (await _roleManager.GetClaimsAsync(companyRole))
                .Select(p => p.Value)
                .ToHashSet();
            userGroupPermissions.AddRange(currentUserGroupPermissions);
            if (newRoleAccessLevel < companyRole.AccessLevel)
            {
                newRoleAccessLevel = companyRole.AccessLevel;
            }
        }


        await _mediator.Send(new AddUserGroupCommand
        {
            Name = newRole,
            AccessLevel = newRoleAccessLevel,
            Permissions = userGroupPermissions.Select(x => new UserGroupPermission
            {
                Name = x,
                Checked = true,
            }).ToList(),
            Users = new List<AssignUserToGroupDto>
            {
                new() {Id = user.Id},
            },
            CreatedById = user.Id,
        }, cancellationToken);

        await _userManager.AddToRolesAsync(user, new List<string> { newRole });
    }
}
