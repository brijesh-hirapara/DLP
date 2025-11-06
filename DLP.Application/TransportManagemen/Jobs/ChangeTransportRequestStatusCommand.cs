using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Hubs;
using DLP.Domain.Enums;
using Hangfire;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.TransportManagemen.Commands
{
    public class ChangeTransportRequestStatusCommand : IRequest<string>
    {
        public string Id { get; set; }
    }
    public class ChangeTransportRequestStatusCommandHandler : IRequestHandler<ChangeTransportRequestStatusCommand, string>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IBackgroundJobClient _backgroundJobClient;
        private readonly IActivityLogger _activityLogger;
        private readonly IHubContext<TransportHub> _hubContext;
        private readonly IEmailCommunicationService _emailCommunicationService;
        //private readonly IEmailTemplateService _emailTemplateService;
        private readonly ICurrentUserService _currentUser;

        public ChangeTransportRequestStatusCommandHandler(IAppDbContext dbContext, IBackgroundJobClient backgroundJobClient, IActivityLogger activityLogger, IEmailCommunicationService emailCommunicationService, IHubContext<TransportHub> hubContext, ICurrentUserService currentUser)
        {
            _dbContext = dbContext;
            _backgroundJobClient = backgroundJobClient;
            _activityLogger = activityLogger;
            _emailCommunicationService = emailCommunicationService;
            _hubContext = hubContext;
            //_emailTemplateService = emailTemplateService;
            _currentUser = currentUser;
        }

        public async Task<string> Handle(ChangeTransportRequestStatusCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var requestId = new Guid(command.Id);

                // Fetch transport request with carrier info
                var transportRequest = await _dbContext.TransportRequests
                    .Include(x => x.TransportCarrier)
                    .FirstOrDefaultAsync(x => x.Id == requestId && x.Status == TransportRequestStatus.Active, cancellationToken);

                if (transportRequest == null)
                    return "Transport request not found or not active.";

                // Reject all pending carriers (if any)
                if (transportRequest.TransportCarrier != null && transportRequest.TransportCarrier.Any())
                {
                    bool hasChanges = false;

                    foreach (var carrier in transportRequest.TransportCarrier)
                    {
                        if (carrier.Status == TransportCarrierStatus.Pending)
                        {
                            carrier.Status = TransportCarrierStatus.Rejected;
                            hasChanges = true;

                            // Optional: Add email notifications here if needed
                            //bool isSendEmail = await _emailTemplateService.SendOfferRejectedEmail(supplier.SupplierId.ToString(), offer, cancellationToken);
                            //bool isSendEmail1 = await _emailTemplateService.SendOfferRejectedEmailFromConsumer(supplier.SupplierId.ToString(), offer, cancellationToken);

                        }
                    }

                    if (hasChanges)
                        await _dbContext.SaveChangesAsync(cancellationToken);
                }

                // Update main transport request status
                transportRequest.Status = TransportRequestStatus.UnderEvaluation;
                await _dbContext.SaveChangesAsync(cancellationToken);

                // Notify clients
                await _hubContext.Clients.All.SendAsync("TransportStatusChanged", command.Id, transportRequest.Status, cancellationToken);

                // Log activity
                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Transport request status auto updated successfully!"
                });

                return "Transport request status changed successfully.";
            }
            catch (Exception ex)
            {
                // Ideally log this exception
                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.ERROR,
                    Activity = $"Error updating transport request status: {ex.Message}"
                });

                throw;
            }
        }
    }
}
