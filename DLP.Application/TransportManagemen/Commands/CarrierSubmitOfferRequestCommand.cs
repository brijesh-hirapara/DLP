using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using static DLP.Application.Common.Auth.CustomPolicies;

namespace DLP.Application.TransportManagemen.Commands
{
    public class CarrierSubmitOfferRequestCommand : IRequest<Unit>
    {
        public required string CurrentUserId { get; set; }
        public Guid TransportRequestId { get; set; }
        public Guid TransportCarrierId { get; set; }
        public decimal? Price { get; set; }
        public int? OfferValidityDate { get; set; }
        public DateTime? EstimatedPickupDateTimeFrom { get; set; }
        public DateTime? EstimatedPickupDateTimeTo { get; set; }
        public DateTime? EstimatedDeliveryDateTimeFrom { get; set; }
        public DateTime? EstimatedDeliveryDateTimeTo { get; set; }
        public TransportCarrierStatus Status { get; set; }
        public Guid? TruckTypeId { get; set; }
    }

    public class CarrierSubmitOfferRequestCommandHandler : IRequestHandler<CarrierSubmitOfferRequestCommand, Unit>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IMediator _mediator;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly ILicenseIdGenerator _licenseIdGenerator;
        private readonly IEmailCommunicationService _emailCommunicationService;
        private readonly ITranslationService _translationService;
        private readonly ILogger<CarrierSubmitOfferRequestCommandHandler> _logger;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;

        public CarrierSubmitOfferRequestCommandHandler(
            IAppDbContext dbContext,
            IMediator mediator,
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            ILicenseIdGenerator licenseIdGenerator,
            IEmailCommunicationService emailCommunicationService,
            ITranslationService translationService,
            ILogger<CarrierSubmitOfferRequestCommandHandler> logger,
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
        public async Task<Unit> Handle(CarrierSubmitOfferRequestCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var transportCarriers = await _dbContext.TransportCarriers
                    .Include(x => x.TransportRequest)
                    .FirstOrDefaultAsync(x => x.Id == command.TransportCarrierId 
                    && x.TransportRequestId == command.TransportRequestId
                    && x.OrganizationId == _currentUser.OrganizationId
                    && !x.IsDeleted
                    , cancellationToken)
                        ?? throw new Exception($"Transport Request {command.TransportRequestId} not found");

                // ✅ Load TransportInformation for schedule details
                var transportInfo = await _dbContext.TransportInformations
                    .FirstOrDefaultAsync(x => x.TransportRequestId == command.TransportRequestId, cancellationToken);

                bool scheduleDiffers = false;

                if (transportInfo != null && transportInfo.DateSelectionOption == DateSelectionOption.SelectDates)
                {
                    scheduleDiffers = CheckScheduleDifference(
                        transportInfo,
                        command.EstimatedPickupDateTimeFrom,
                        command.EstimatedDeliveryDateTimeFrom);
                }

                var offerValidityHours = (double)(command.OfferValidityDate ?? 2); // default to 2 hours if null
                var expiryDateTime = DateTime.UtcNow.AddHours(offerValidityHours);


                if (transportCarriers != null)
                {
                    transportCarriers.Price = command.Price;
                    transportCarriers.OfferValidityDate = command.OfferValidityDate;
                    transportCarriers.EstimatedPickupDateTimeFrom = command.EstimatedPickupDateTimeFrom;
                    transportCarriers.EstimatedPickupDateTimeTo = command.EstimatedPickupDateTimeTo;
                    transportCarriers.EstimatedDeliveryDateTimeFrom = command.EstimatedDeliveryDateTimeFrom;
                    transportCarriers.EstimatedDeliveryDateTimeTo = command.EstimatedDeliveryDateTimeTo;
                    transportCarriers.IsScheduleDiffers = scheduleDiffers;
                    transportCarriers.ExpiryDateTime = expiryDateTime;
                    transportCarriers.IsExpired = false;
                    transportCarriers.Status = TransportCarrierStatus.Accepted;
                    transportCarriers.TruckTypeId = command.TruckTypeId;
                    transportCarriers.UpdatedAt = DateTime.UtcNow;
                    transportCarriers.UpdatedById = _currentUser.UserId;

                    _dbContext.TransportCarriers.Update(transportCarriers);
                    
                    await _activityLogger.Add(new ActivityLogDto
                    {
                        UserId = _currentUser.UserId,
                        LogTypeId = (int)LogTypeEnum.INFO,
                        Activity = "Successfully Carrier Submit Transport Request"
                    });
                    await _dbContext.SaveChangesAsync(cancellationToken);
                }

                var carrierOfferObj = new CarrierOfferResultEmailViewModel();
                carrierOfferObj.EvaluationResult = "Submited";
                carrierOfferObj.RequestId = transportCarriers.TransportRequest.RequestId;


                await _emailCommunicationService.SendSubmitedOfferToSuperAdminEmail(carrierOfferObj, cancellationToken);

                return Unit.Value;
            }
            catch (Exception ex)
            {
                var message = $"Message: {ex.Message}, Details: {JsonConvert.SerializeObject(ex)}";
                await _activityLogger.Exception(message, "Failed to Carrier Submit Transport Request", _currentUser.UserId);
                throw new Exception(ex.Message);
            }
        }

        private static bool CheckScheduleDifference(TransportInformation transportInfo, DateTime? pickup, DateTime? delivery)
        {
            bool pickupOutsideRange = false, deliveryOutsideRange = false;

            if (transportInfo.PickupDateFrom.HasValue && transportInfo.PickupDateTo.HasValue && pickup.HasValue)
            {
                var pickupStart = CombineDateAndTime(transportInfo.PickupDateFrom.Value, transportInfo.PickupTimeFrom);
                var pickupEnd = CombineDateAndTime(transportInfo.PickupDateTo.Value, transportInfo.PickupTimeTo);
                pickupOutsideRange = pickup < pickupStart || pickup > pickupEnd;
            }

            if (transportInfo.DeliveryDateFrom.HasValue && transportInfo.DeliveryDateTo.HasValue && delivery.HasValue)
            {
                var deliveryStart = CombineDateAndTime(transportInfo.DeliveryDateFrom.Value, transportInfo.DeliveryTimeFrom);
                var deliveryEnd = CombineDateAndTime(transportInfo.DeliveryDateTo.Value, transportInfo.DeliveryTimeTo);
                deliveryOutsideRange = delivery < deliveryStart || delivery > deliveryEnd;
            }

            return pickupOutsideRange || deliveryOutsideRange;
        }


        private static DateTime CombineDateAndTime(DateTime date, string? timeString)
        {
            if (string.IsNullOrWhiteSpace(timeString))
                return date.Date;

            return TimeSpan.TryParse(timeString, out var time)
                ? date.Date.Add(time)
                : date.Date;
        }
    }
}
