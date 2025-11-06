using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Requests.Notifications;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DLP.Application.Requests.Commands;

public class RejectRequestCommand : IRequest<Unit>
{
    public string CurrentUserId { get; set; }
    public Guid RequestId { get; set; }
    public string Comments { get; set; }
}

public class RejectRequestCommandHandler : IRequestHandler<RejectRequestCommand, Unit>
{
    private readonly IAppDbContext _dbContext;
    private readonly IEmailCommunicationService _emailCommunicationService;
    private readonly ILogger<RejectRequestCommandHandler> _logger;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUser;
    private readonly IMediator _mediator;

    public RejectRequestCommandHandler(
        IAppDbContext dbContext,
        IEmailCommunicationService emailCommunicationService,
        ILogger<RejectRequestCommandHandler> logger,
        IActivityLogger activityLogger,
        ICurrentUserService currentUser,
        IMediator mediator)
    {
        _dbContext = dbContext;
        _emailCommunicationService = emailCommunicationService;
        _logger = logger;
        _activityLogger = activityLogger;
        _currentUser = currentUser;
        _mediator = mediator;
    }

    public async Task<Unit> Handle(RejectRequestCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var request = await _dbContext.Requests
                //.Include(x => x.Municipality)
                .FirstOrDefaultAsync(x => x.Id == command.RequestId, cancellationToken)
                ?? throw new Exception($"Request {command.RequestId} not found");

            request.Status = RequestStatus.Rejected;
            request.Comments += "\nComments from rejection: " + command.Comments;
            request.ReviewedById = _currentUser.UserId;
            request.ReviewedAt = DateTime.Now;

            if (request.CompanyId == null)
            {
                await _emailCommunicationService.SendCompanyRejectedEmail(request, cancellationToken);
            }
            else
            {
                await _emailCommunicationService.SendRequestRejectedEmail(request, cancellationToken);
            }

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUser.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = $"Request {request.Type} with ID {request.Id} has been rejected."
            });
            await _mediator.Publish(new RejectRequestNotification(request/*, request.Municipality.StateEntityId*/), cancellationToken);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while handling the RejectRequestCommand");

            throw;
        }
    }
}

