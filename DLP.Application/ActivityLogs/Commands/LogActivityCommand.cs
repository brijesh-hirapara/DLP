using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using MediatR;

namespace DLP.Application.ActivityLogs.Commands;

public class LogActivityCommand : IRequest<Unit>
{
    public string UserId { get; set; }
    public int LogTypeId { get; set; } = 1;
    public string Activity { get; set; }
    public string Description { get; set; }
}

public class LogActivityCommandHandler : IRequestHandler<LogActivityCommand, Unit>
{
    private readonly IActivityLogger _logger;

    public LogActivityCommandHandler(IActivityLogger logger)
    {
        _logger = logger;
    }

    public async Task<Unit> Handle(LogActivityCommand request, CancellationToken cancellationToken)
    {
        await _logger.Add(new ActivityLogDto
        {
            UserId = request.UserId,
            LogTypeId = request.LogTypeId,
            Activity = request.Activity,
            Description = request.Description
        });
        return Unit.Value;
    }
}
