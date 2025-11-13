using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace DLP.Application.Shipments.Commands
{
    public class ConfirmPickupAndDeliveryCommand : IRequest<Unit>
    {
        public Guid ShipmentId { get; set; }
    }

    public class ConfirmPickupAndDeliveryCommandHandler : IRequestHandler<ConfirmPickupAndDeliveryCommand, Unit>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IMediator _mediator;
        private readonly ILogger<ConfirmPickupAndDeliveryCommandHandler> _logger;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;

        public ConfirmPickupAndDeliveryCommandHandler(
            IAppDbContext dbContext,
            IMediator mediator,
            ITranslationService translationService,
            ILogger<ConfirmPickupAndDeliveryCommandHandler> logger,
            IActivityLogger activityLogger,
            ICurrentUserService currentUser
            )
        {
            _dbContext = dbContext;
            _mediator = mediator;
            _logger = logger;
            _activityLogger = activityLogger;
            _currentUser = currentUser;
        }
        public async Task<Unit> Handle(ConfirmPickupAndDeliveryCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var shipment = await _dbContext.Shipments
                     .Include(x => x.TransportRequest)
                     .FirstOrDefaultAsync(x => x.Id == command.ShipmentId && !x.IsDeleted, cancellationToken)
                     ?? throw new Exception($"Shipment with ID '{command.ShipmentId}' not found.");

                string activityMessage;
                if (shipment.IsTruckAssigned && !shipment.IsPickupConfirmed)
                {
                    // 🔄 Update shipment status
                    shipment.ShipmentCarrierStatus = ShipmentsCarrierStatus.PickupConfirmed;
                    shipment.IsPickupConfirmed = true;
                    shipment.PickupConfirmedDate = DateTime.UtcNow;
                    shipment.Status = ShipmentsStatus.Active; // ✅ Enum based on SRS v4.3
                    shipment.TruckAssignedDate = DateTime.UtcNow;
                    shipment.UpdatedAt = DateTime.UtcNow;
                    shipment.UpdatedById = _currentUser.UserId;

                    _dbContext.Shipments.Update(shipment);
                    await _dbContext.SaveChangesAsync(cancellationToken);
                    activityMessage = $"Pickup confirmed successfully (Shipment Request Id: {shipment.RequestId})";

                }
                else if (shipment.IsTruckAssigned && shipment.IsPickupConfirmed)
                {
                    // 🔄 Update shipment status
                    shipment.ShipmentCarrierStatus = ShipmentsCarrierStatus.DeliveryConfirmed;
                    shipment.IsDeliveryConfirmed = true;
                    shipment.DeliveryConfirmedDate = DateTime.UtcNow;
                    shipment.Status = ShipmentsStatus.Active; // ✅ Enum based on SRS v4.3
                    shipment.TruckAssignedDate = DateTime.UtcNow;
                    shipment.UpdatedAt = DateTime.UtcNow;
                    shipment.UpdatedById = _currentUser.UserId;

                    _dbContext.Shipments.Update(shipment);
                    await _dbContext.SaveChangesAsync(cancellationToken);
                    activityMessage = $"Delivery confirmed successfully (Shipment Request Id: {shipment.RequestId})";
                }
                else
                {
                    throw new Exception("Invalid shipment state for confirmation.");
                }


                // 📝 Log activity
                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = activityMessage
                });

                _logger.LogInformation("Truck assigned successfully for shipment {ShipmentId}", shipment.Id);

                return Unit.Value;
            }
            catch (Exception ex)
            {
                var message = $"Message: {ex.Message}, Details: {JsonConvert.SerializeObject(ex)}";
                await _activityLogger.Exception(message, "Failed to confirm shipment pickup/delivery", _currentUser.UserId);
                _logger.LogError(ex, "Error confirming shipment {ShipmentId}", command.ShipmentId);
                throw new Exception($"Failed to confirm shipment: {ex.Message}");
            }
        }
    }
}
