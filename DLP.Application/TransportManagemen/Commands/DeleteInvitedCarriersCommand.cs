using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
    public class DeleteInvitedCarriersCommand : IRequest<Unit>
    {
        public string TransportRequestId { get; set; }
        public string TransportCarrierId { get; set; }
    }

    public class DeleteInvitedCarriersCommandHandler : IRequestHandler<DeleteInvitedCarriersCommand, Unit>
    {
        private readonly UserManager<User> _userManager;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;
        private readonly IBlacklistService _blacklistService;
        private readonly IAppDbContext _dbContext;

        public DeleteInvitedCarriersCommandHandler(UserManager<User> userManager, IActivityLogger activityLogger, ICurrentUserService currentUser, IBlacklistService blacklistService, IAppDbContext dbContext)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _activityLogger = activityLogger;
            _currentUser = currentUser;
            _blacklistService = blacklistService;
        }

        public async Task<Unit> Handle(DeleteInvitedCarriersCommand request, CancellationToken cancellationToken)
        {
            try
            {

                if (string.IsNullOrWhiteSpace(request.TransportRequestId))
                    throw new ApplicationException("Transport Request Id is required.");

                if (string.IsNullOrWhiteSpace(request.TransportCarrierId))
                    throw new ApplicationException("Transport Carrier Id is required.");


                var transportRequestId = Guid.Parse(request.TransportRequestId);
                var transportCarrierId = Guid.Parse(request.TransportCarrierId);


                var transportRequest = await _dbContext.TransportRequests
                   .Include(tr => tr.TransportCarrier)
                   .FirstOrDefaultAsync(x => x.Id == transportRequestId && !x.IsDeleted, cancellationToken);


                if (transportRequest == null)
                    throw new NotFoundException("Transport Request not found.");

                var carrier = transportRequest.TransportCarrier
                    .FirstOrDefault(c => c.Id == transportCarrierId);

                if (carrier == null)
                    throw new NotFoundException("Transport Carrier not found.");


                // 🔹 Option 1: Soft Delete (recommended if you use soft delete flags)
                carrier.IsDeleted = true;
                carrier.IsActive = false;
                carrier.UpdatedAt = DateTime.UtcNow;
                carrier.UpdatedById = _currentUser.UserId;


                // 🔹 Option 2 (if you prefer hard delete, uncomment this instead)
                // _dbContext.TransportCarriers.Remove(carrier);

                await _dbContext.SaveChangesAsync(cancellationToken);

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Carrier '{carrier.Id}' removed from Transport Request '{transportRequest.Id}'."
                });

                return Unit.Value;

            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Failed to delete invited carrier", _currentUser.UserId);
                throw new ApplicationException($"Failed to delete invited carrier: {ex.Message}");
            }
        }
    }
}

