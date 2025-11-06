using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.TransportManagemen.Commands
{
    public class DeleteTransportTemplateCommand : IRequest<Unit>
    {
        public string TransportTemplateId { get; set; }
    }

    public class DeleteTransportTemplateCommandHandler : IRequestHandler<DeleteTransportTemplateCommand, Unit>
    {
        private readonly UserManager<User> _userManager;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;
        private readonly IBlacklistService _blacklistService;
        private readonly IAppDbContext _dbContext;

        public DeleteTransportTemplateCommandHandler(UserManager<User> userManager, IActivityLogger activityLogger, ICurrentUserService currentUser, IBlacklistService blacklistService, IAppDbContext dbContext)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _activityLogger = activityLogger;
            _currentUser = currentUser;
            _blacklistService = blacklistService;
        }

        public async Task<Unit> Handle(DeleteTransportTemplateCommand request, CancellationToken cancellationToken)
        {
            try
            {

                var transportRequests = await _dbContext.TransportRequests.FirstOrDefaultAsync(x => !x.IsDeleted && x.Id == new Guid(request.TransportTemplateId));

                if (transportRequests == null)
                {
                    await _activityLogger.Exception("Template not found for delete!", _currentUser.UserId);
                    throw new NotFoundException("Template not found");
                }

                transportRequests.IsDeleted = true;
                transportRequests.IsActive = false;

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Template {transportRequests.TemplateName} has been soft deleted"
                });

                return Unit.Value;
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Failed to delete Template", _currentUser.UserId);
                throw;
            }
        }
    }
}

