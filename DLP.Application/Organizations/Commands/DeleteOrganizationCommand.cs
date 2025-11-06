using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Organizations.Notifications;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using LinqKit;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace DLP.Application.Organizations.Commands;

public class DeleteOrganizationCommand : IRequest<Unit>
{
    public Guid OrganizationId { get; set; }
}

public class DeleteOrganizationCommandHandler : IRequestHandler<DeleteOrganizationCommand, Unit>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMediator _mediator;
    private readonly RoleManager<Role> _roleManager;


    public DeleteOrganizationCommandHandler(
        IAppDbContext dbContext, 
        IActivityLogger activityLogger, 
        ICurrentUserService currentUserService,
        RoleManager<Role> roleManager,
        IMediator mediator)
    {
        _context = dbContext;
        _activityLogger = activityLogger;
        _currentUserService = currentUserService;
        _mediator = mediator;
        _roleManager = roleManager;
    }

    public async Task<Unit> Handle(DeleteOrganizationCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var organization = await _context.Organizations.FindAsync(request.OrganizationId, cancellationToken)
                ?? throw new NotFoundException($"Organization with ID {request.OrganizationId} not found.");

            organization.IsDeleted = true;

            if (organization.Type == Domain.Enums.OrganizationTypeEnum.INSTITUTION)
            {
                var employees = _context.Users.Where(x => x.OrganizationId == organization.Id);
                employees.ForEach(x => x.IsActive = false);
                _context.Users.UpdateRange(employees);
            }
            _context.Organizations.Update(organization);
            await _context.SaveChangesAsync(cancellationToken);

            var userGroup = await _roleManager.FindByNameAsync($"{organization.Name} - Super Administrator");
            if (userGroup != null)
            {
                await _roleManager.DeleteAsync(userGroup);
            }
            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = $"Organization (ID: {organization.Id}) deleted successfully."
            });

            await _mediator.Publish(new DeleteOrganizationNotification(organization.Id, organization.Type), cancellationToken);

            return Unit.Value;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to delete organization", _currentUserService.UserId);

            throw; // Re-throw the caught exception to inform the caller about the failure.
        }
    }
}
