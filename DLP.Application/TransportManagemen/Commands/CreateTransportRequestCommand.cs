using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.TransportManagemen.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DLP.Application.TransportManagemen.Commands;

public class CreateTransportRequestCommand : IRequest<string>
{
    public AccessibilityAvailable Accessibility { get; set; }
    public decimal TotalDistance { get; set; }
    public bool IsTemplate { get; set; } = false;
    public string? TemplateName { get; set; }
    public TransportPickupDto TransportPickup { get; set; }
    public TransportDeliveryDto TransportDelivery { get; set; }
    public TransportGoodsDto TransportGoods { get; set; }
    public TransportInformationDto TransportInformation { get; set; }

}

public class CreateTransportRequestCommandHandler : IRequestHandler<CreateTransportRequestCommand, string>
{
    private readonly IAppDbContext _dbContext;
    private readonly IMediator _mediator;
    private readonly ILicenseIdGenerator _licenseIdGenerator;
    private readonly IBlobService _blobService;
    private readonly IEmailCommunicationService _emailCommunicationService;
    private readonly ILogger<CreateTransportRequestCommandHandler> _logger;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUser;
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly ITransportRequestService _transportRequestService;

    public CreateTransportRequestCommandHandler(
        IAppDbContext dbContext,
        IMediator mediator,
        ILicenseIdGenerator licenseIdGenerator,
        IBlobServiceFactory blobServiceFactory,
        IEmailCommunicationService emailCommunicationService,
        ILogger<CreateTransportRequestCommandHandler> logger,
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

    public async Task<string> Handle(CreateTransportRequestCommand command, CancellationToken cancellationToken)
    {
        try
        {

            if (command.IsTemplate)
            {
                if (string.IsNullOrWhiteSpace(command.TemplateName))
                    throw new ApplicationException("Template name cannot be empty.");

                var normalizedName = command.TemplateName.Trim().ToLower();

                bool templateExists = await _dbContext.TransportRequests
                    .AnyAsync(x => x.IsTemplate &&
                        x.TemplateName.ToLower().Trim() == normalizedName);

                if (templateExists)
                    throw new ApplicationException($"Template already exists: {command.TemplateName}");
            }

            //var transportCarrier = await _dbContext.Organizations
            //                     .Where(x => x.Type == OrganizationTypeEnum.CARRIER && !x.IsDeleted)
            //                     .Select(x => new TransportCarrierDto
            //                     {
            //                         OrganizationId = x.Id
            //                     })
            //                     .ToListAsync();



            //var vehicleFleetRequestsIds = await _dbContext.Questionnaire
            //    .Where(x => x.RequestType == "RegistraterAsCarrier"
            //    && x.ModuleName == "VehicleFleetRequest"
            //    && x.QuestionNo == 5
            //    // && (x.CodebookId == command.TransportPickup.CountryId || x.CodebookId == command.TransportDelivery.CountryId)
            //    )
            //   .Select(x => x.RequestId).ToListAsync();

            //var transportCarrier = await _dbContext.VehicleFleetRequests
            //    .Include(o => o.Organization)
            //    .Where(x => x.Status == (int)VehicleFleetRequestStatus.Confirmed
            //    && vehicleFleetRequestsIds.Contains(x.Id.ToString())
            //    && x.Organization.Type == OrganizationTypeEnum.CARRIER && !x.IsDeleted && !x.Organization.IsDeleted)
            //    .Select(x => new TransportCarrierDto
            //    {
            //        OrganizationId = x.OrganizationId.Value,
            //        TaxNumber = x.Organization.TaxNumber,
            //    })
            //    .Distinct()
            //    .ToListAsync();

            // Step 1: Get confirmed vehicle fleet request IDs
            var vehicleFleetRequestsIds = await _dbContext.VehicleFleetRequests
                .Where(x => x.Status == (int)VehicleFleetRequestStatus.Confirmed)
                .Select(x => x.Id)
                .ToListAsync(cancellationToken);

            // Step 2: Get all approved carrier registration requests by pickup country
            //var requestList = await _dbContext.Requests
            //    .Where(x =>
            //        (x.CountryId == command.TransportPickup.CountryId ||
            //         x.CountryId == command.TransportPickup.CountryId) && // ✅ redundant condition, can simplify later
            //        x.Type == RequestType.RegistraterAsCarrier &&
            //        x.Status == RequestStatus.Approved)
            //    .Select(x => x.IdNumber)
            //    .ToListAsync(cancellationToken);

            // Step 3: Get list of carrier organization IDs
            var carrierOrganizationIds = await _dbContext.Organizations
                .Where(x =>
                    x.Type == OrganizationTypeEnum.CARRIER &&
                    !x.IsDeleted &&
                    (x.CountryId == command.TransportPickup.CountryId ||
                     x.CountryId == command.TransportPickup.CountryId))
                .Select(x => x.Id)
                .ToListAsync(cancellationToken);

            // Step 4: Get valid transport carriers linked to those organizations and confirmed fleet requests
            var transportCarriers = await _dbContext.VehicleFleetRequests
                .Include(o => o.Organization)
                .Where(x =>
                    x.Status == (int)VehicleFleetRequestStatus.Confirmed &&
                    vehicleFleetRequestsIds.Contains(x.Id) && // ✅ Id is int or long, no need ToString()
                    carrierOrganizationIds.Contains(x.OrganizationId.Value) &&
                    x.Organization.Type == OrganizationTypeEnum.CARRIER &&
                    !x.IsDeleted &&
                    !x.Organization.IsDeleted)
                .Select(x => new TransportCarrierDto
                {
                    OrganizationId = x.OrganizationId.Value,
                })
                .Distinct()
                .ToListAsync(cancellationToken);




            //var pickup = command.TransportPickup;
            //var goods = command.TransportGoods;
            //var info = command.TransportInformation;

            //var eligibleCarriers = await _dbContext.Organizations
            //    .Include(c => c.Vehicles)
            //    .Where(c => c.Type == OrganizationTypeEnum.CARRIER
            //        && c.Vehicles.Any(v =>
            //            v.IsActive &&
            //            !v.IsAssigned &&
            //            v.MaxLoadWeight >= goods.Weight &&
            //            v.MaxLoadVolume >= goods.Length &&
            //            (!goods.TemperatureControlled || v.IsTemperatureControlled) &&
            //            GeoDistance(v.CurrentLocation, pickup.PickupLocationId) <= allowedRadius))
            //    .ToListAsync(cancellationToken);


            var transportRequest = new TransportRequest
            {
                Id = Guid.NewGuid(),
                RequestId = await GetNextRequestId(),
                TotalDistance = command.TotalDistance,
                Accessibility = command.Accessibility,
                TransportPickup = await AddTransportPickup(command.TransportPickup, cancellationToken),
                TransportDelivery = await AddTransportDelivery(command.TransportDelivery, cancellationToken),
                TransportGoods = await AddTransportGoods(command.TransportGoods, cancellationToken),
                TransportInformation = await AddTransportInformation(command.TransportInformation, cancellationToken),
                TransportCarrier = await AddTransportCarrier(transportCarriers, cancellationToken),
                Status = TransportRequestStatus.Active,
                OrganizationId = _currentUser.OrganizationId,
                CreatedAt = DateTime.UtcNow,
                CreatedById = _currentUser.UserId,
                IsTemplate = false,
                IsActive = true,
            };
            await _dbContext.TransportRequests.AddAsync(transportRequest, cancellationToken);

            if (command.IsTemplate)
            {
                var transportRequestTemplate = new TransportRequest
                {
                    Id = Guid.NewGuid(),
                    Accessibility = command.Accessibility,
                    TotalDistance = command.TotalDistance,
                    TransportPickup = await AddTransportPickup(command.TransportPickup, cancellationToken),
                    TransportDelivery = await AddTransportDelivery(command.TransportDelivery, cancellationToken),
                    TransportGoods = await AddTransportGoods(command.TransportGoods, cancellationToken),
                    TransportInformation = await AddTransportInformation(command.TransportInformation, cancellationToken),
                    TransportCarrier = await AddTransportCarrier(transportCarriers, cancellationToken),
                    OrganizationId = _currentUser.OrganizationId,
                    TemplateName = command.TemplateName,
                    Status = TransportRequestStatus.Active,
                    CreatedAt = DateTime.UtcNow,
                    CreatedById = _currentUser.UserId,
                    IsTemplate = true,
                    IsActive = true,
                };
                await _dbContext.TransportRequests.AddAsync(transportRequestTemplate, cancellationToken);
            }
            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUser.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Request created successfully!"
            });

            _backgroundJobClient.Schedule(() => _transportRequestService.ChangeTransportEvaluationStatus(transportRequest.Id.ToString(), DateTime.UtcNow.AddHours(24).ToString("yyyy-MM-dd HH:mm:ss"), "Transport Request Create"), TimeSpan.FromHours(24));
            _backgroundJobClient.Schedule(() => _transportRequestService.ChangeTransportCompletedOrRejected(transportRequest.Id.ToString(), DateTime.UtcNow.AddHours(48).ToString("yyyy-MM-dd HH:mm:ss"), "Transport Request Completed Or Rejected"), TimeSpan.FromHours(48));

            // Build Carrier Offer Email View Models

            var carrierEmailList = await _dbContext.Organizations
                                .Include(x => x.ContactPerson)
                                .Where(x => x.Type == OrganizationTypeEnum.CARRIER && !x.IsDeleted)
                                .Select(u => new CarrierOfferEmailViewModel
                                {
                                    Email = u.ContactPerson.Email,
                                    FullName = u.ContactPerson.FullName,
                                    UserLang = u.ContactPerson.LanguageId.ToString(),
                                    RequestId = transportRequest.RequestId,
                                    PickupCity = command.TransportPickup.City,
                                    DeliveryCity = command.TransportDelivery.City,
                                    GoodsDescription = $"{command.TransportGoods.Quantity} × {command.TransportGoods.TypeOfGoodsId}",
                                    Weight = command.TransportGoods.Weight,
                                    OfferDeadline = command.TransportInformation.PickupDateTo ?? DateTime.UtcNow.AddDays(1),
                                    Link = $"/active-requests?search={transportRequest.RequestId}"
                                })
                                .ToListAsync(cancellationToken);

            await _emailCommunicationService.SendCarrierOfferEmail(carrierEmailList, cancellationToken);
            //await _dbContext.SaveChangesAsync();

            //await _emailCommunicationService.SendRequestSubmittedEmail(request, cancellationToken);
            return transportRequest.RequestId;
        }
        catch (Exception ex)
        {
            // Log and re-throw the exception
            await _activityLogger.Exception(ex.Message, "Request couldn't be created!", _currentUser.UserId);
            _logger.LogError(ex, "An error occurred while handling the CreateRequestCommand");
            throw new ApplicationException(
                $"Request failed to be created with error message: {ex.InnerException?.Message ?? ex.Message}");
        }
    }

    //private async Task<string> GetNextRequestId()
    //{
    //    // Retrieve the last numeric part of the highest RequestId in the database
    //    var lastNumericPart = await _dbContext.TransportRequests
    //        .OrderByDescending(r => r.RequestId)
    //        .Select(r => r.RequestId.Substring(5)) // RequestId format is YEAR-XXXX (5 characters for year)
    //        .FirstOrDefaultAsync();

    //    int nextNumericPart = string.IsNullOrEmpty(lastNumericPart)
    //        ? 1
    //        : int.Parse(lastNumericPart) + 1;
    //    string year = DateTime.Now.Year.ToString();
    //    string formattedNumericPart = nextNumericPart.ToString("D4");
    //    string requestId = $"{year}-{formattedNumericPart}";

    //    return requestId;
    //}

    private async Task<string> GetNextRequestId()
    {
        // Current month and year in MMYY format (e.g., 0825 for August 2025)
        string currentMonthYear = DateTime.UtcNow.ToString("MMyy");

        // Retrieve the last request ID for the same month-year pattern
        var lastRequestId = await _dbContext.TransportRequests
            .Where(r => r.RequestId.EndsWith(currentMonthYear))
            .OrderByDescending(r => r.RequestId)
            .Select(r => r.RequestId)
            .FirstOrDefaultAsync();

        int nextSequence = 1;

        if (!string.IsNullOrEmpty(lastRequestId))
        {
            // Example: "023-0825" → Extract "023"
            var prefix = lastRequestId.Split('-').FirstOrDefault();
            if (int.TryParse(prefix, out int lastSeq))
            {
                nextSequence = lastSeq + 1;
            }
        }

        // Format: XXX-MMYY (e.g., 001-0825)
        string newRequestId = $"{nextSequence:D3}-{currentMonthYear}";

        return newRequestId;
    }


    private async Task<List<TransportPickup>> AddTransportPickup(TransportPickupDto transportPickup, CancellationToken cancellationToken)
    {
        var transportPickupList = new List<TransportPickup>();

        //foreach (var pickup in transportPickup)
        //{
        var transportPickupDetails = new TransportPickup
        {
            CompanyName = transportPickup.CompanyName,
            CountryId = transportPickup.CountryId,
            CompanyAddress = transportPickup.CompanyAddress,
            PostalCode = transportPickup.PostalCode,
            City = transportPickup.City,
        };
        transportPickupList.Add(transportPickupDetails);
        //}
        return transportPickupList;
    }

    private async Task<List<TransportDelivery>> AddTransportDelivery(TransportDeliveryDto transportDelivery, CancellationToken cancellationToken)
    {
        var transportDeliveryList = new List<TransportDelivery>();

        //foreach (var delivery in transportDelivery)
        //{
        var transportDeliveryDetails = new TransportDelivery
        {
            CompanyName = transportDelivery.CompanyName,
            CountryId = transportDelivery.CountryId,
            CompanyAddress = transportDelivery.CompanyAddress,
            PostalCode = transportDelivery.PostalCode,
            City = transportDelivery.City,
        };
        transportDeliveryList.Add(transportDeliveryDetails);
        //}
        return transportDeliveryList;
    }

    private async Task<List<TransportGoods>> AddTransportGoods(TransportGoodsDto transportGoods, CancellationToken cancellationToken)
    {
        var transportGoodsList = new List<TransportGoods>();

        //foreach (var goods in transportGoods)
        //{
        var transportGoodsDetails = new TransportGoods
        {
            TypeOfGoodsId = transportGoods.TypeOfGoodsId,
            Quantity = transportGoods.Quantity,
            Length = transportGoods.Length,
            Width = transportGoods.Width,
            Height = transportGoods.Height,
            Weight = transportGoods.Weight,
            IsIncludesAdrGoods = transportGoods.IsIncludesAdrGoods,
            IsCargoNotStackable = transportGoods.IsCargoNotStackable,
        };
        transportGoodsList.Add(transportGoodsDetails);
        //}
        return transportGoodsList;
    }

    private async Task<List<TransportInformation>> AddTransportInformation(TransportInformationDto transportInformation, CancellationToken cancellationToken)
    {
        var transportInformationList = new List<TransportInformation>();


        //foreach (var information in transportInformation)
        //{

        if (transportInformation.CurrencyId == null ||
     !Guid.TryParse(transportInformation.CurrencyId.ToString(), out var validCurrencyId) ||
     validCurrencyId == Guid.Empty)
        {
            return new List<TransportInformation>();
        }

        var transportInformationDetails = new TransportInformation
        {
            DateSelectionOption = transportInformation.DateSelectionOption,
            PickupDateFrom = transportInformation.PickupDateFrom,
            PickupDateTo = transportInformation.PickupDateTo,
            PickupTimeFrom = transportInformation.PickupTimeFrom,
            PickupTimeTo = transportInformation.PickupTimeTo,
            DeliveryDateFrom = transportInformation.DeliveryDateFrom,
            DeliveryDateTo = transportInformation.DeliveryDateTo,
            DeliveryTimeFrom = transportInformation.DeliveryTimeFrom,
            DeliveryTimeTo = transportInformation.DeliveryTimeTo,
            CurrencyId = transportInformation.CurrencyId,
        };
        transportInformationList.Add(transportInformationDetails);
        //}
        return transportInformationList;
    }

    private async Task<List<TransportCarrier>> AddTransportCarrier(List<TransportCarrierDto> transportCarrier, CancellationToken cancellationToken)
    {
        var transportCarrierList = new List<TransportCarrier>();

        foreach (var carrier in transportCarrier)
        {
            var transportCarrierDetails = new TransportCarrier
            {
                OrganizationId = carrier.OrganizationId,
                Status = TransportCarrierStatus.Pending,
                InvitationStatus = TransportCarrierInvitationStatus.SystemInvited,
                IsDeleted = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedById = _currentUser.UserId
            };
            transportCarrierList.Add(transportCarrierDetails);
        }
        return transportCarrierList;
    }
}
