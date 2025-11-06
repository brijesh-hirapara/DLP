using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace DLP.Application.TransportManagemen.Commands
{
    public class ShipperBookOfferRequestCommand : IRequest<Unit>
    {
        public Guid TransportRequestId { get; set; }
        public Guid TransportCarrierId { get; set; }
    }

    public class ShipperBookOfferRequestCommandHandler : IRequestHandler<ShipperBookOfferRequestCommand, Unit>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IMediator _mediator;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly ILicenseIdGenerator _licenseIdGenerator;
        private readonly IEmailCommunicationService _emailCommunicationService;
        private readonly ITranslationService _translationService;
        private readonly ILogger<ShipperBookOfferRequestCommandHandler> _logger;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;

        public ShipperBookOfferRequestCommandHandler(
            IAppDbContext dbContext,
            IMediator mediator,
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            ILicenseIdGenerator licenseIdGenerator,
            IEmailCommunicationService emailCommunicationService,
            ITranslationService translationService,
            ILogger<ShipperBookOfferRequestCommandHandler> logger,
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
        public async Task<Unit> Handle(ShipperBookOfferRequestCommand command, CancellationToken cancellationToken)
        {
            await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                var now = DateTime.UtcNow;

                // ✅ 1. Fetch selected offer
                var selectedOffer = await _dbContext.TransportCarriers
                    .FirstOrDefaultAsync(x => x.Id == command.TransportCarrierId
                        && x.TransportRequestId == command.TransportRequestId
                        && x.OrganizationId == _currentUser.OrganizationId
                        && !x.IsDeleted,
                        cancellationToken)
                    ?? throw new Exception($"Offer not found for Transport Request {command.TransportRequestId}");

                // ✅ 2. Check if offer already expired
                if (selectedOffer.ExpiryDateTime.HasValue && now >= selectedOffer.ExpiryDateTime.Value)
                {
                    selectedOffer.IsExpired = true;
                    _dbContext.TransportCarriers.Update(selectedOffer);

                    await _dbContext.SaveChangesAsync(cancellationToken);
                    throw new Exception("This offer has expired and cannot be booked.");
                }

                // ✅ 3. Mark selected offer as booked
                selectedOffer.IsShipperBook = true;
                selectedOffer.Status = TransportCarrierStatus.Locked; // or Booked, per enum
                selectedOffer.UpdatedAt = now;
                selectedOffer.UpdatedById = _currentUser.UserId;

                _dbContext.TransportCarriers.Update(selectedOffer);

                // ✅ 4. Invalidate all other offers for the same request
                var otherOffers = await _dbContext.TransportCarriers
                    .Where(x => x.TransportRequestId == command.TransportRequestId
                        && x.Id != command.TransportCarrierId
                        && !x.IsDeleted)
                    .ToListAsync(cancellationToken);

                foreach (var offer in otherOffers)
                {
                    offer.Status = TransportCarrierStatus.Rejected;
                    offer.UpdatedAt = now;
                    offer.UpdatedById = _currentUser.UserId;
                }

                _dbContext.TransportCarriers.UpdateRange(otherOffers);

                // ✅ 5. Update Transport Request status to Completed
                var transportRequest = await _dbContext.TransportRequests
                    .FirstOrDefaultAsync(x => x.Id == command.TransportRequestId && !x.IsDeleted && x.Status == TransportRequestStatus.UnderEvaluation, cancellationToken);

                if (transportRequest != null)
                {
                    transportRequest.Status = TransportRequestStatus.Completed;
                    transportRequest.UpdatedAt = now;
                    transportRequest.UpdatedById = _currentUser.UserId;
                    _dbContext.TransportRequests.Update(transportRequest);
                }

                // ✅ 6. Save all changes in transaction
                await _dbContext.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                // ✅ 7. Log activity
                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Shipper successfully booked offer for Transport Request: {command.TransportRequestId}"
                });

                return Unit.Value;
            }
            catch (Exception ex)
            {
                var message = $"Message: {ex.Message}, Details: {JsonConvert.SerializeObject(ex)}";
                await _activityLogger.Exception(message, "Failed to Carrier Submit Transport Request", _currentUser.UserId);
                throw new Exception(ex.Message);
            }
        }


    }
}
