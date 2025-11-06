using Hangfire;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Organizations.Notifications;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Organizations.Commands;

public class ChangeOrganizationStatusCommand : IRequest<Unit>
{
    public Guid OrganizationId { get; set; }
    public OrganizationStatus Status { get; set; }
}

public class ChangeOrganizationStatusCommandHandler : IRequestHandler<ChangeOrganizationStatusCommand, Unit>
{
    private readonly IAppDbContext _context;
    private readonly IMediator _mediator;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUserService;
    private readonly IBackgroundJobClient _backgroundJobClient;

    public ChangeOrganizationStatusCommandHandler(
        IAppDbContext context,
        IMediator mediator,
        IActivityLogger activityLogger,
        ICurrentUserService currentUserService,
        IBackgroundJobClient backgroundJobClient)
    {
        _context = context;
        _mediator = mediator;
        _activityLogger = activityLogger;
        _currentUserService = currentUserService;
        _backgroundJobClient = backgroundJobClient;
    }

    public async Task<Unit> Handle(ChangeOrganizationStatusCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var organization = await _context.Organizations
                .FirstOrDefaultAsync(x => x.Id == request.OrganizationId, cancellationToken)
                ?? throw new NotFoundException($"Organization with ID {request.OrganizationId} not found.");

            organization.Status = request.Status;
            organization.UpdatedAt = DateTime.Now;
            organization.UpdatedById = _currentUserService.UserId;

            _context.Organizations.Update(organization);
            await _context.SaveChangesAsync(cancellationToken);

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = $"Organization (ID: {organization.Id}) status was changed to {request.Status.ToString()}."
            });

            await _mediator.Publish(new ChangeOrganizationStatusNotification(organization.Id, organization.Type),
                cancellationToken);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to update organization", _currentUserService.UserId);
            throw;
        }
    }
}


