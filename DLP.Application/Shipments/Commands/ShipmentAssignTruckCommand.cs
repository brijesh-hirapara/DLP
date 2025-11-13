using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace DLP.Application.Shipments.Commands
{
    public class ShipmentAssignTruckCommand : IRequest<Unit>
    {
        public Guid ShipmentId { get; set; }
        public string TruckDriverFirstName { get; set; }
        public string TruckDriverLastName { get; set; }
        public string PhoneNumber { get; set; }
        public string PassportId { get; set; }
        public string TruckNumber { get; set; }
    }

    public class ShipmentAssignTruckCommandHandler : IRequestHandler<ShipmentAssignTruckCommand, Unit>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IMediator _mediator;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly ILicenseIdGenerator _licenseIdGenerator;
        private readonly IEmailCommunicationService _emailCommunicationService;
        private readonly ITranslationService _translationService;
        private readonly ILogger<ShipmentAssignTruckCommandHandler> _logger;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;

        public ShipmentAssignTruckCommandHandler(
            IAppDbContext dbContext,
            IMediator mediator,
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            ILicenseIdGenerator licenseIdGenerator,
            IEmailCommunicationService emailCommunicationService,
            ITranslationService translationService,
            ILogger<ShipmentAssignTruckCommandHandler> logger,
            IActivityLogger activityLogger,
            ICurrentUserService currentUser
            )
        {
            _dbContext = dbContext;
            _mediator = mediator;
            _userManager = userManager;
            _roleManager = roleManager;
            _licenseIdGenerator = licenseIdGenerator;
            _emailCommunicationService = emailCommunicationService;
            _translationService = translationService;
            _logger = logger;
            _activityLogger = activityLogger;
            _currentUser = currentUser;
        }
        public async Task<Unit> Handle(ShipmentAssignTruckCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var shipment = await _dbContext.Shipments
                     .Include(x => x.TransportRequest)
                     .FirstOrDefaultAsync(x => x.Id == command.ShipmentId && !x.IsDeleted, cancellationToken)
                     ?? throw new Exception($"Shipment with ID '{command.ShipmentId}' not found.");


                // 🔍 Check for existing truck assignment
                var existingTruck = await _dbContext.ShipmentAssignTrucks
                    .FirstOrDefaultAsync(x => x.ShipmentId == command.ShipmentId && !x.IsDeleted, cancellationToken);






                string activityMessage;
                if (existingTruck != null)
                {
                    // 🧭 Update existing truck assignment
                    existingTruck.TruckDriverFirstName = command.TruckDriverFirstName;
                    existingTruck.TruckDriverLastName = command.TruckDriverLastName;
                    existingTruck.PhoneNumber = command.PhoneNumber;
                    existingTruck.PassportId = command.PassportId;
                    existingTruck.TruckNumber = command.TruckNumber;
                    existingTruck.UpdatedAt = DateTime.UtcNow;
                    existingTruck.UpdatedById = _currentUser.UserId;

                    _dbContext.ShipmentAssignTrucks.Update(existingTruck);
                    activityMessage = $"Truck assignment updated successfully (Shipment Request Id: {shipment.RequestId})";
                }
                else
                {
                    // 🚚 Create new truck assignment
                    var assignTruck = new ShipmentAssignTruck
                    {
                        Id = Guid.NewGuid(),
                        ShipmentId = shipment.Id,
                        TransportRequestId = shipment.TransportRequestId,
                        RequestId = shipment.RequestId,
                        TruckDriverFirstName = command.TruckDriverFirstName,
                        TruckDriverLastName = command.TruckDriverLastName,
                        PhoneNumber = command.PhoneNumber,
                        PassportId = command.PassportId,
                        TruckNumber = command.TruckNumber,
                        CreatedAt = DateTime.UtcNow,
                        CreatedById = _currentUser.UserId,
                        IsActive = true,
                        IsDeleted = false
                    };

                    await _dbContext.ShipmentAssignTrucks.AddAsync(assignTruck, cancellationToken);
                    activityMessage = $"Truck assigned successfully (Shipment Request Id: {shipment.RequestId})";
                }

                // 🔄 Update shipment status
                shipment.ShipmentCarrierStatus = ShipmentsCarrierStatus.TruckAssigned;
                shipment.IsTruckAssigned = true;
                shipment.TruckAssignedDate = DateTime.UtcNow;
                shipment.Status = ShipmentsStatus.Active; // ✅ Enum based on SRS v4.3
                shipment.TruckAssignedDate = DateTime.UtcNow;
                shipment.UpdatedAt = DateTime.UtcNow;
                shipment.UpdatedById = _currentUser.UserId;

                _dbContext.Shipments.Update(shipment);
                await _dbContext.SaveChangesAsync(cancellationToken);

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
                await _activityLogger.Exception(message, "Failed to assign truck for shipment", _currentUser.UserId);
                _logger.LogError(ex, "Error assigning truck to shipment {ShipmentId}", command.ShipmentId);
                throw new Exception($"Failed to assign truck: {ex.Message}");
            }
        }
    }
}
