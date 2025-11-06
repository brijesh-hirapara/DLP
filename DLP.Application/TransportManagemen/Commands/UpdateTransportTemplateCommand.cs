using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.TransportManagemen.DTOs;
using DLP.Domain.Enums;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DLP.Application.TransportManagemen.Commands
{
    public class UpdateTransportTemplateCommand : IRequest<string>
    {
        public string TemplateId { get; set; }
        public AccessibilityAvailable Accessibility { get; set; }
        public decimal TotalDistance { get; set; }
        public bool IsTemplate { get; set; } = false;
        public string? TemplateName { get; set; }
        public TransportPickupDto TransportPickup { get; set; }
        public TransportDeliveryDto TransportDelivery { get; set; }
        public TransportGoodsDto TransportGoods { get; set; }
        public TransportInformationDto TransportInformation { get; set; }

    }

    public class UpdateTransportTemplateCommandHandler : IRequestHandler<UpdateTransportTemplateCommand, string>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IMediator _mediator;
        private readonly ILicenseIdGenerator _licenseIdGenerator;
        private readonly IBlobService _blobService;
        private readonly IEmailCommunicationService _emailCommunicationService;
        private readonly ILogger<UpdateTransportTemplateCommandHandler> _logger;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;
        private readonly IBackgroundJobClient _backgroundJobClient;
        private readonly ITransportRequestService _transportRequestService;

        public UpdateTransportTemplateCommandHandler(
            IAppDbContext dbContext,
            IMediator mediator,
            ILicenseIdGenerator licenseIdGenerator,
            IBlobServiceFactory blobServiceFactory,
            IEmailCommunicationService emailCommunicationService,
            ILogger<UpdateTransportTemplateCommandHandler> logger,
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

        public async Task<string> Handle(UpdateTransportTemplateCommand command, CancellationToken cancellationToken)
        {
            try
            {

                if (string.IsNullOrWhiteSpace(command.TemplateId))
                    throw new ApplicationException("Template ID is required.");

                var templateGuid = Guid.Parse(command.TemplateId);

                var existingTemplate = await _dbContext.TransportRequests
                   .Include(t => t.TransportPickup)
                   .Include(t => t.TransportDelivery)
                   .Include(t => t.TransportGoods)
                   .Include(t => t.TransportInformation)
                   .Include(t => t.TransportCarrier)
                   .FirstOrDefaultAsync(t => t.Id == templateGuid && t.IsTemplate, cancellationToken);

                if (existingTemplate == null)
                    throw new ApplicationException("Transport template not found.");



                // Check duplicate name if updated
                if (!string.IsNullOrWhiteSpace(command.TemplateName))
                {
                    var normalizedName = command.TemplateName.Trim().ToLower();
                    bool duplicate = await _dbContext.TransportRequests.AnyAsync(x =>
                        x.IsTemplate &&
                        x.TemplateName.ToLower().Trim() == normalizedName &&
                        x.Id != existingTemplate.Id, cancellationToken);

                    if (duplicate)
                        throw new ApplicationException($"Template with name '{command.TemplateName}' already exists.");
                }

                // Update main template fields
                existingTemplate.TemplateName = command.TemplateName;
                existingTemplate.Accessibility = command.Accessibility;
                existingTemplate.TotalDistance = command.TotalDistance;
                existingTemplate.UpdatedAt = DateTime.UtcNow;
                existingTemplate.UpdatedById = _currentUser.UserId;


                // Update nested TransportPickup
                if (existingTemplate.TransportPickup.Any())
                {
                    var pickup = existingTemplate.TransportPickup.First();
                    pickup.CompanyName = command.TransportPickup.CompanyName;
                    pickup.CountryId = command.TransportPickup.CountryId;
                    pickup.CompanyAddress = command.TransportPickup.CompanyAddress;
                    pickup.PostalCode = command.TransportPickup.PostalCode;
                    pickup.City = command.TransportPickup.City;
                }


                // Update TransportDelivery
                if (existingTemplate.TransportDelivery.Any())
                {
                    var delivery = existingTemplate.TransportDelivery.First();
                    delivery.CompanyName = command.TransportDelivery.CompanyName;
                    delivery.CountryId = command.TransportDelivery.CountryId;
                    delivery.CompanyAddress = command.TransportDelivery.CompanyAddress;
                    delivery.PostalCode = command.TransportDelivery.PostalCode;
                    delivery.City = command.TransportDelivery.City;
                }

                // Update TransportGoods
                if (existingTemplate.TransportGoods.Any())
                {
                    var goods = existingTemplate.TransportGoods.First();
                    goods.TypeOfGoodsId = command.TransportGoods.TypeOfGoodsId;
                    goods.Quantity = command.TransportGoods.Quantity;
                    goods.Length = command.TransportGoods.Length;
                    goods.Width = command.TransportGoods.Width;
                    goods.Height = command.TransportGoods.Height;
                    goods.Weight = command.TransportGoods.Weight;
                    goods.IsIncludesAdrGoods = command.TransportGoods.IsIncludesAdrGoods;
                    goods.IsCargoNotStackable = command.TransportGoods.IsCargoNotStackable;
                }

                // Update TransportInformation
                if (existingTemplate.TransportInformation.Any())
                {
                    var info = existingTemplate.TransportInformation.First();
                    info.DateSelectionOption = command.TransportInformation.DateSelectionOption;
                    info.PickupDateFrom = command.TransportInformation.PickupDateFrom;
                    info.PickupDateTo = command.TransportInformation.PickupDateTo;
                    info.PickupTimeFrom = command.TransportInformation.PickupTimeFrom;
                    info.PickupTimeTo = command.TransportInformation.PickupTimeTo;
                    info.DeliveryDateFrom = command.TransportInformation.DeliveryDateFrom;
                    info.DeliveryDateTo = command.TransportInformation.DeliveryDateTo;
                    info.DeliveryTimeFrom = command.TransportInformation.DeliveryTimeFrom;
                    info.DeliveryTimeTo = command.TransportInformation.DeliveryTimeTo;
                    info.CurrencyId = command.TransportInformation.CurrencyId;
                }


                await _dbContext.SaveChangesAsync(cancellationToken);

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Transport template '{existingTemplate.TemplateName}' updated successfully!"
                });

                return existingTemplate.TemplateName;

            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Transport template update failed!", _currentUser.UserId);
                _logger.LogError(ex, "An error occurred while updating the transport template.");
                throw new ApplicationException(
                    $"Transport template update failed: {ex.InnerException?.Message ?? ex.Message}");
            }
        }
    }
}
