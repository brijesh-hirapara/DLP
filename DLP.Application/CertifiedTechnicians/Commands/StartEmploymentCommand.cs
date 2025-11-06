using DLP.Application.ActivityLogs.Dto;
using DLP.Application.CertifiedTechnicians.Notifications;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.CertifiedTechnicians.Commands;
public class StartEmploymentCommand : IRequest<Unit>
{
    public List<string> TechnicianIds { get; set; }
    public string? StartDate { get; set; }
    public Guid? OrganizationId { get; set; }
    public bool TriggerNotification { get; set; } = true;
}
public class StartEmploymentCommandHandler : IRequestHandler<StartEmploymentCommand, Unit>
{
    private readonly IAppDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly IActivityLogger _activityLogger;
    private readonly IMediator _mediator;

    public StartEmploymentCommandHandler(
        IAppDbContext dbContext,
        ICurrentUserService currentUserService,
        IMediator mediator,
        IActivityLogger activityLogger)
    {
        _dbContext = dbContext;
        _mediator = mediator;
        _currentUserService = currentUserService;
        _activityLogger = activityLogger;
    }

    public async Task<Unit> Handle(StartEmploymentCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var organizationId = (request.OrganizationId ?? _currentUserService.OrganizationId) ?? throw new Exception("Organization couldn't be found!");

            var technicians = await _dbContext.Users
                .Include(x => x.EmploymentHistory)
                .Where(x => request.TechnicianIds.Contains(x.Id))
                .ToListAsync(cancellationToken);

            foreach (var technician in technicians)
            {
                technician.OrganizationId = organizationId;

                technician.EmploymentHistory.Add(new Employment
                {
                    CertifiedTechnicianId = technician.Id,
                    CompanyId = organizationId,
                    StartDate = DateTime.Now,
                });

                _dbContext.Users.Update(technician);
            }

            await _dbContext.SaveChangesAsync(cancellationToken);
            var toSyncEmploymentHistory = technicians.SelectMany(x => x.EmploymentHistory).ToList();

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = $"Started employment for technicians with IDs: {string.Join(", ", request.TechnicianIds)}"
            });

            if (toSyncEmploymentHistory.Any() && request.TriggerNotification)
            {
                await _mediator.Publish(new StartEmploymentNotification(toSyncEmploymentHistory));
            }
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, $"Failed to start employment for technicians with IDs: {string.Join(", ", request.TechnicianIds)}", _currentUserService.UserId);
            throw new Exception(ex.Message);
        }

        return Unit.Value;
    }
}


