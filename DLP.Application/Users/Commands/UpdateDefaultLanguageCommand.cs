using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace DLP.Application.Users.Commands;

public class UpdateDefaultLanguageCommand : IRequest<Unit>
{
    public Guid LanguageId { get; set; }
    public string UserId { get; set; }
}

public class UpdateDefaultLanguageCommandHandler : IRequestHandler<UpdateDefaultLanguageCommand, Unit>
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<UpdateDefaultLanguageCommandHandler> _logger;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUser;

    public UpdateDefaultLanguageCommandHandler(
        UserManager<User> userManager,
        ILogger<UpdateDefaultLanguageCommandHandler> logger,
        IActivityLogger activityLogger,
        ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _logger = logger;
        _activityLogger = activityLogger;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(UpdateDefaultLanguageCommand request, CancellationToken cancellationToken)
    {
        string errorMessage = string.Empty;
        try
        {
            var user = await _userManager.FindByIdAsync(request.UserId);
            if (user == null)
            {  
                errorMessage = "User not found!";
                throw new Exception(errorMessage);
            }
            user.LanguageId = request.LanguageId;
            user.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errorMessages = string.Join("\n", result.Errors.Select(x => x.Description));
                await _activityLogger.Error(errorMessages, _currentUser.UserId);
                _logger.LogError(errorMessages);
                throw new Exception(errorMessages);
            }

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUser.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "User default language updated"
            });

            return Unit.Value;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to update user default language", _currentUser.UserId);

            throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
        }
    }
}
