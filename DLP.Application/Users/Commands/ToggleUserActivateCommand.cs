using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace DLP.Application.Users.Commands
{
    public class ToggleUserActivateCommand : IRequest<Unit>
    {
        public string UserId { get; set; }
        public bool IsActive { get; set; }

    }
    public class ToggleUserActivateCommandHandler : IRequestHandler<ToggleUserActivateCommand, Unit>
    {
        private readonly UserManager<User> _userManager;
        private readonly IEmailCommunicationService _emailService;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUserService;

        public ToggleUserActivateCommandHandler(UserManager<User> userManager, IEmailCommunicationService emailService, IActivityLogger logger, ICurrentUserService currentUserService)
        {
            _userManager = userManager;
            _emailService = emailService;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(ToggleUserActivateCommand request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            try
            {
                var user = await _userManager.FindByIdAsync(request.UserId);
                if (user == null)
                {
                    errorMessage = "User doesn't exist!";
                    throw new Exception(errorMessage);
                }

                var previousIsActive = user.IsActive;

                user.IsActive = request.IsActive;
                await _userManager.UpdateAsync(user);

                await _emailService.SendUserToggleActivationEmail(user.Email, user.LanguageId.Value, request.IsActive, cancellationToken);

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = request.IsActive
                        ? "User account activated"
                        : "User account deactivated"
                });

                return Unit.Value;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to toggle user activation", _currentUserService.UserId);
                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }
        }
    }

}
