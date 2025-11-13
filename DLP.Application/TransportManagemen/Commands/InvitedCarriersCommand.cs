using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Enums;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DLP.Application.TransportManagemen.Commands
{
    public class InvitedCarriersCommand : IRequest<string>
    {
        public string TrasportRequestId { get; set; }
        public List<string> OrganizationIds { get; set; }

    }

    public class InvitedCarriersCommandHandler : IRequestHandler<InvitedCarriersCommand, string>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IMediator _mediator;
        private readonly ILicenseIdGenerator _licenseIdGenerator;
        private readonly IBlobService _blobService;
        private readonly IEmailCommunicationService _emailCommunicationService;
        private readonly ILogger<InvitedCarriersCommandHandler> _logger;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;
        private readonly IBackgroundJobClient _backgroundJobClient;
        private readonly ITransportRequestService _transportRequestService;

        public InvitedCarriersCommandHandler(
            IAppDbContext dbContext,
            IMediator mediator,
            ILicenseIdGenerator licenseIdGenerator,
            IBlobServiceFactory blobServiceFactory,
            IEmailCommunicationService emailCommunicationService,
            ILogger<InvitedCarriersCommandHandler> logger,
            IActivityLogger activityLogger,
            ICurrentUserService currentUser,
            IBackgroundJobClient backgroundJobClient,
            ITransportRequestService transportRequestService
            )
        {
            _dbContext = dbContext;
            _mediator = mediator;
            _licenseIdGenerator = licenseIdGenerator;
            _blobService = blobServiceFactory.Create(FolderNames.Requests);
            _emailCommunicationService = emailCommunicationService;
            _logger = logger;
            _activityLogger = activityLogger;
            _currentUser = currentUser;
            _backgroundJobClient = backgroundJobClient;
            _transportRequestService = transportRequestService;
        }

        public async Task<string> Handle(InvitedCarriersCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(command.TrasportRequestId))
                    throw new ApplicationException("Transport Request Id is required.");

                if (command.OrganizationIds == null || !command.OrganizationIds.Any())
                    throw new ApplicationException("OrganizationIds must contain at least one organization.");

                var transportRequestId = Guid.Parse(command.TrasportRequestId);

                var existingRequest = await _dbContext.TransportRequests
                    .Include(t => t.TransportPickup)
                    .Include(t => t.TransportDelivery)
                    .Include(t => t.TransportGoods)
                    .Include(t => t.TransportInformation)
                    .Include(t => t.TransportCarrier)
                    .FirstOrDefaultAsync(t => t.Id == transportRequestId, cancellationToken);

                if (existingRequest == null)
                    throw new ApplicationException("Transport Request not found.");

                // ✅ Throw error if status is not Active
                if (existingRequest.Status != TransportRequestStatus.Active)
                {
                    var message = $"Cannot invite carriers. Transport Request '{existingRequest.RequestId}' is not Active (Current status: {existingRequest.Status}).";

                    await _activityLogger.Add(new ActivityLogDto
                    {
                        UserId = _currentUser.UserId,
                        LogTypeId = (int)LogTypeEnum.ERROR,
                        Activity = message
                    });

                    throw new ApplicationException(message);
                }


                // existing invited organization IDs (Guid)
                var existingOrgIds = existingRequest.TransportCarrier
                    .Select(tc => tc.OrganizationId)
                    .Where(g => g != Guid.Empty)
                    .ToHashSet();

                var invalidIds = new List<string>();
                var newOrgGuids = new List<Guid>();

                foreach (var orgIdStr in command.OrganizationIds)
                {
                    if (Guid.TryParse(orgIdStr, out var orgGuid) && orgGuid != Guid.Empty)
                    {
                        if (!existingOrgIds.Contains(orgGuid))
                            newOrgGuids.Add(orgGuid);
                    }
                    else
                    {
                        invalidIds.Add(orgIdStr);
                    }
                }

                if (invalidIds.Any())
                {
                    // Log invalid organization ids (optional: you can persist this or return a message)
                    await _activityLogger.Add(new ActivityLogDto
                    {
                        UserId = _currentUser.UserId,
                        LogTypeId = (int)LogTypeEnum.INFO,
                        Activity = $"InvitedCarriers: Invalid OrganizationIds skipped: {string.Join(", ", invalidIds)}"
                    });
                }

                if (newOrgGuids.Any())
                {
                    foreach (var orgGuid in newOrgGuids)
                    {
                        var carrier = new Domain.Entities.TransportCarrier
                        {
                            TransportRequestId = existingRequest.Id,
                            OrganizationId = orgGuid,
                            Status = TransportCarrierStatus.Pending,
                            InvitationStatus = TransportCarrierInvitationStatus.ManuallyInvited,
                        };

                        existingRequest.TransportCarrier.Add(carrier);
                    }

                    _dbContext.TransportRequests.Update(existingRequest);
                    await _dbContext.SaveChangesAsync(cancellationToken);

                    await _activityLogger.Add(new ActivityLogDto
                    {
                        UserId = _currentUser.UserId,
                        LogTypeId = (int)LogTypeEnum.INFO,
                        Activity = $"Carriers (Organizations) invited successfully for Transport Request '{existingRequest.RequestId}'."
                    });
                }
                else
                {
                    await _activityLogger.Add(new ActivityLogDto
                    {
                        UserId = _currentUser.UserId,
                        LogTypeId = (int)LogTypeEnum.INFO,
                        Activity = $"No new valid organizations to invite for Transport Request '{existingRequest.RequestId}'."
                    });
                }

                return existingRequest.RequestId;

            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Inviting carriers failed!", _currentUser.UserId);
                _logger.LogError(ex, "An error occurred while inviting carriers.");
                throw new ApplicationException(
                    $"Inviting carriers failed: {ex.InnerException?.Message ?? ex.Message}");
            }
        }
    }
}