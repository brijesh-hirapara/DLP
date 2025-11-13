using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.Hubs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Hangfire;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Shipments.Jobs
{
    public class ChangeShippingPODConfirmCommand : IRequest<string>
    {
        public string Id { get; set; }
    }
    public class ChangeShippingPODConfirmCommandHandler : IRequestHandler<ChangeShippingPODConfirmCommand, string>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IBackgroundJobClient _backgroundJobClient;
        private readonly IActivityLogger _activityLogger;
        private readonly IHubContext<TransportHub> _hubContext;
        private readonly IEmailCommunicationService _emailCommunicationService;
        private readonly ICurrentUserService _currentUser;

        public ChangeShippingPODConfirmCommandHandler(IAppDbContext dbContext, IBackgroundJobClient backgroundJobClient, IActivityLogger activityLogger, IEmailCommunicationService emailCommunicationService, IHubContext<TransportHub> hubContext, ICurrentUserService currentUser)
        {
            _dbContext = dbContext;
            _backgroundJobClient = backgroundJobClient;
            _activityLogger = activityLogger;
            _emailCommunicationService = emailCommunicationService;
            _hubContext = hubContext;
            _currentUser = currentUser;
        }

        public async Task<string> Handle(ChangeShippingPODConfirmCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var shipmentId = new Guid(command.Id);

                var shipment = await _dbContext.Shipments
                     .Include(x => x.TransportRequest)
                     .FirstOrDefaultAsync(x => x.Id == shipmentId && !x.IsDeleted, cancellationToken)
                     ?? throw new Exception($"Shipment with ID '{shipmentId}' not found.");


                // 🔄 Update shipment status
                shipment.ShipmentCarrierStatus = ShipmentsCarrierStatus.PODConfirmed;
                shipment.IsPODConfirmed = true;
                shipment.PODConfirmedDate = DateTime.UtcNow;
                shipment.Status = ShipmentsStatus.Completed; // ✅ Enum based on SRS v4.3
                shipment.UpdatedAt = DateTime.UtcNow;
                shipment.UpdatedById = _currentUser.UserId;

                _dbContext.Shipments.Update(shipment);
                await _dbContext.SaveChangesAsync(cancellationToken);

                var activityMessage = $"POD confirmed successfully (Shipment Request ID: {shipment.RequestId})";


                // 📝 Log activity
                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = activityMessage
                });


                // 🔔 Notify UI (optional)
                await _hubContext.Clients.All.SendAsync("ShipmentStatusUpdated", new
                {
                    ShipmentId = shipment.Id,
                    Status = shipment.Status.ToString(),
                    Message = activityMessage
                });

                var shipperEmailDetail = await _dbContext.Organizations
                              .Include(x => x.ContactPerson)
                              .Where(x => x.Type == OrganizationTypeEnum.SHIPPER && !x.IsDeleted)
                              .Select(u => new ShipperShipmentEmailViewModel
                              {
                                  Email = u.ContactPerson.Email,
                                  FullName = u.ContactPerson.FullName,
                                  UserLang = u.ContactPerson.LanguageId.ToString(),
                                  RequestId = shipment.RequestId,
                                  EvaluationResult = ShipmentsCarrierStatus.PODConfirmed.ToString(),
                              })
                              .FirstOrDefaultAsync(cancellationToken);


                // 📧 Send email (optional)
                await _emailCommunicationService.SendPODConfirmationEmail(shipperEmailDetail, cancellationToken);

                return activityMessage;
            }
            catch (Exception ex)
            {
                // Ideally log this exception
                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.ERROR,
                    Activity = $"Error confirming POD: {ex.Message}"
                });

                throw;
            }
        }
    }
}