using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Users.Commands
{
    public class ToggleUserDeleteCommand : IRequest<Unit>
    {
        public string UserId { get; set; }
        public bool IsDeleted { get; set; }

    }
    public class ToggleUserDeleteCommandHandler : IRequestHandler<ToggleUserDeleteCommand, Unit>
    {
        private readonly UserManager<User> _userManager;
        private readonly IAppDbContext _context;
        private readonly IEmailCommunicationService _emailService;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUserService;

        public ToggleUserDeleteCommandHandler(UserManager<User> userManager, IEmailCommunicationService emailService, IActivityLogger logger, ICurrentUserService currentUserService, IAppDbContext context)
        {
            _userManager = userManager;
            _emailService = emailService;
            _logger = logger;
            _currentUserService = currentUserService;
            _context = context;
        }

        public async Task<Unit> Handle(ToggleUserDeleteCommand request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            try
            {
                var user = await _userManager.Users.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == request.UserId);

                if (user == null)
                {
                    errorMessage = "User doesn't exist!";
                    throw new Exception(errorMessage);
                }

                //var previousIsActive = user.IsDeleted;

                user.IsDeleted = request.IsDeleted;
                user.IsActive = true;
                await _userManager.UpdateAsync(user);

                //await _emailService.SendUserToggleActivationEmail(user.Email, user.LanguageId.Value, request.IsDeleted, cancellationToken);

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = request.IsDeleted
                        ? "User account deleted"
                        : "User account undeleted"
                });

                return Unit.Value;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to toggle user delete", _currentUserService.UserId);
                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }
        }
    }

}
