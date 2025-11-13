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
    public class CancelTransportTemplateCommand : IRequest<Unit>
    {
        public string TransportRequestId { get; set; }
    }

    public class CancelTransportTemplateCommandHandler : IRequestHandler<CancelTransportTemplateCommand, Unit>
    {
        private readonly UserManager<User> _userManager;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;
        private readonly IBlacklistService _blacklistService;
        private readonly IAppDbContext _dbContext;

        public CancelTransportTemplateCommandHandler(UserManager<User> userManager, IActivityLogger activityLogger, ICurrentUserService currentUser, IBlacklistService blacklistService, IAppDbContext dbContext)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _activityLogger = activityLogger;
            _currentUser = currentUser;
            _blacklistService = blacklistService;
        }

        public async Task<Unit> Handle(CancelTransportTemplateCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var transportRequest = await _dbContext.TransportRequests
                    .Include(x=>x.TransportCarrier)
                    .FirstOrDefaultAsync(x => !x.IsDeleted && x.Id == new Guid(request.TransportRequestId));

                if (transportRequest == null)
                {
                    await _activityLogger.Exception("Transport request not found for cancel!", _currentUser.UserId);
                    throw new NotFoundException("Transport request not found");
                }

                // ✅ Allow cancel only if status = Active OR UnderEvaluation
                if (transportRequest.Status != TransportRequestStatus.Active &&
                    transportRequest.Status != TransportRequestStatus.UnderEvaluation)
                {
                    await _activityLogger.Exception(
                        $"Transport Request {transportRequest.RequestId} cannot be cancelled because its status is {transportRequest.Status}",
                        _currentUser.UserId);

                    throw new NotFoundException("Only requests with status 'Active' or 'Under Evaluation' can be cancelled.");
                }

                // ✅ Update status to Cancelled
                transportRequest.Status = TransportRequestStatus.Cancelled;
                transportRequest.IsActive = true;
                transportRequest.IsDeleted = false; // keep visible in UI if required

                // ✅ Also cancel related offers if any
                var relatedOffers = transportRequest.TransportCarrier
                    .Where(x => x.TransportRequestId == transportRequest.Id && !x.IsDeleted);

                foreach (var offer in relatedOffers)
                {
                    offer.Status = TransportCarrierStatus.Rejected; // or .Cancelled depending on your enum
                    offer.IsActive = false;
                }

                // ✅ Save changes
                await _dbContext.SaveChangesAsync(cancellationToken);

                // ✅ Log action
                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Transport Request {transportRequest.RequestId} has been cancelled by user {_currentUser.UserId}"
                });

                return Unit.Value;
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Failed to cancel transport request", _currentUser.UserId);
                throw;
            }
        }
    }
}