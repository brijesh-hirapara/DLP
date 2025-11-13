using ClosedXML.Excel;
//using DocumentFormat.OpenXml.Vml;
using iTextSharp.text;
using iTextSharp.text.pdf;
using DLP.Application.ActivityLogs.Queries;
using DLP.Application.Cantons.Queries;
using DLP.Application.CertifiedTechnicians.Queries;
using DLP.Application.Codebooks.Queries;
using DLP.Application.Common.Export;
using DLP.Application.Common.Interfaces;
using DLP.Application.CompanyBranches.Queries;
using DLP.Application.Equipments.Queries;
using DLP.Application.ImportExportSubstances.Queries;
using DLP.Application.Municipalities.Queries;
using DLP.Application.Organizations.Queries;
using DLP.Application.RefrigerantTypes.Queries;
using DLP.Application.Registers.Queries;
using DLP.Application.Reports.Queries;
using DLP.Application.Requests.Queries;
using DLP.Application.ServiceTechnician.Queries;
using DLP.Application.StateEntities.Queries;
using DLP.Application.Users.Enums;
using DLP.Application.Users.Queries;
using DLP.Controllers.Shared;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using Rectangle = iTextSharp.text.Rectangle;
using DLP.Application.VehicleFleetRequests.Queries;
using DLP.Application.TransportManagemen.Queries;

namespace DLP.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ExportController : ApiControllerBase
{
    private readonly IMediator _mediator;
    private readonly IWebHostEnvironment _env;
    private readonly ITranslationService _translationService;
    private readonly UserManager<User> _userManager;
    private readonly ICurrentUserService _currentUserService;
    public ExportController(IWebHostEnvironment env, ITranslationService translationService, UserManager<User> userManager, ICurrentUserService currentUserService, IMediator mediator)
    {
        _env = env;
        _translationService = translationService;
        _userManager = userManager;
        _currentUserService = currentUserService;
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Export([FromQuery] ExportList request)
    {
        try
        {
            string dateFormat = "dd.MM.yyyy";
            string dateFormatWithTime = "dd.MM.yyyy HH:mm:ss";
            var user = await _userManager.FindByIdAsync(_currentUserService.UserId);
            Guid userLanguageId;
            if (user != null)
            {
                userLanguageId = user.LanguageId.Value;
            }
            else
            {
                userLanguageId = request.LanguageId;
            }
            var userColumnNames = new Dictionary<string, string>();
            switch (request.CallFrom)
            {
                case "User":
                    var userResponse = await Mediator.Send(new GetUsersQuery { Search = request.Search, FilterType = (UserFilterType)request.FilterType, IsFromExport = true });
                    var userExcel = userResponse.Items.Select(u => new
                    {
                        // Select specific columns for export
                        No = u.OrdinalNumber,
                        User = u.FirstName + " " + u.LastName,
                        Email = u.Email,
                        UserGroupName = u.RoleName,
                        Status = u.IsDeleted
                                ? "Deleted"
                                : u.IsPending && !u.IsActive
                                    ? "Pending"
                                    : u.IsActive && !u.IsDeleted && !u.IsPending
                                        ? "Active"
                                        : "Disabled",
                        JoinDate = u.CreatedAt.HasValue
                                    ? ConvertUtcToLocalAndFormat(u.CreatedAt.Value, request.TimeZone, dateFormat)
                                    : string.Empty
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                        {
                            { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                            { "User",await _translationService.Translate(userLanguageId, "title.user", "User")  },
                            { "Email",await _translationService.Translate(userLanguageId, "users:table.title.email", "Email")  },
                            { "UserGroupName",await _translationService.Translate(userLanguageId, "users:table.title.user-group", "UserGroupName")   },
                            { "Status",await _translationService.Translate(userLanguageId, "global:status", "Status")  },
                            { "JoinDate",await _translationService.Translate(userLanguageId, "users:table.join-date", "Join Date")  },
                        };

                    return ExportType(userExcel, request.ExportType, "UserManagment", userColumnNames);

                case "Companies":
                    var institutionResponse = await Mediator.Send(new GetOrganizationsQuery { Search = request.Search, MunicipalityId = request.MunicipalityId, EntityId = request.EntityId, IsFromExport = true });
                    var institutionExcel = institutionResponse.Items.Select(u => new
                    {
                        // Select specific columns for export
                        No = u.OrdinalNumber,
                        Name = u.Name,
                        CompanyAdministrator = u.CompanyAdministrator != null && u.CompanyAdministrator.Any()
                        ? string.Join(", ", u.CompanyAdministrator.Select(ca => ca.FullName + " - " + (ca.IsActive ? "Active" : "Deactive")))
                        : "-",

                        OtherUsers = u.OtherUsers != null && u.OtherUsers.Any()
                        ? string.Join(", ", u.OtherUsers.Select(ou => ou.FullName + " - " + (ou.IsActive ? "Active" : "Deactive")))
                        : "-",
                        DateOfRegistration = u.DateOfRegistration.HasValue
                        ? ConvertUtcToLocalAndFormat(u.DateOfRegistration.Value, request.TimeZone, dateFormat)
                        : "-",
                        Status = u.Status,
                        // Add other properties as needed
                    }).ToList();

                    // Translate columns as per the language Wise
                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "Name",await _translationService.Translate(userLanguageId, "global.company-name", "Company Name")  },
                        { "CompanyAdministrator",await _translationService.Translate(userLanguageId, "global.company-administrator", "Company Administrator")  },
                        { "OtherUsers",await _translationService.Translate(userLanguageId, "global:other-users", "OtherUsers")   },
                        { "DateOfRegistration",await _translationService.Translate(userLanguageId, "global:date-of-registration", "Date Of Registration")   },
                        { "Status",await _translationService.Translate(userLanguageId, "global:status", "Status")   },
                    };

                    return ExportType(institutionExcel, request.ExportType, "Companies", userColumnNames);

                case "VehicleFleetRequests":
                    var vehicleFleetRequestsResponse = await Mediator.Send(new GetVehicleFleetRequestsQuery { Search = request.Search, Status = request.FilterType, IsCarrier = request.IsCarrier, ListArchived = request.ListArchived, IsFromExport = true });
                    var vehicleFleetRequestsExcel = vehicleFleetRequestsResponse.Items.Select(u => new
                    {
                        // Select specific columns for export
                        No = u.OrdinalNumber,
                        Name = u.Name,
                        Comments = u.Comments,
                        CreatedAt = ConvertUtcToLocalAndFormat(u.CreatedAt, request.TimeZone, dateFormat),
                        Status = u.Status,
                        // Add other properties as needed
                    }).ToList();

                    // Translate columns as per the language Wise
                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "Comments",await _translationService.Translate(userLanguageId, "global:comments", "Comments")   },
                        { "Name",await _translationService.Translate(userLanguageId, "global.company-name", "Company Name")  },
                        { "CreatedAt",await _translationService.Translate(userLanguageId, "global.submission-date", "Submission Date")  },
                        { "Status",await _translationService.Translate(userLanguageId, "global:status", "Status")   },
                    };

                    return ExportType(vehicleFleetRequestsExcel, request.ExportType, "VehicleFleetRequests", userColumnNames);

                case "ActiveVehicleFleets":
                    var activeVehicleFleetsResponse = await Mediator.Send(new GetVehicleFleetRequestsQuery { Search = request.Search, Status = request.FilterType, IsCarrier = request.IsCarrier, ListArchived = request.ListArchived, IsFromExport = true });
                    var activeVehicleFleetsExcel = activeVehicleFleetsResponse.Items.Select(u => new
                    {
                        // Select specific columns for export
                        No = u.OrdinalNumber,
                        Name = u.Name,
                        Comments = u.Comments,
                        ActionedAt = u.ActionedAt.HasValue
                        ? ConvertUtcToLocalAndFormat(u.ActionedAt.Value, request.TimeZone, dateFormat)
                        : "-",
                        TotalVehicle = u.TotalVehicle,
                        UpdatedAt = u.UpdatedAt.HasValue
                        ? ConvertUtcToLocalAndFormat(u.UpdatedAt.Value, request.TimeZone, dateFormat)
                        : "-",
                        Status = u.Status,
                        // Add other properties as needed
                    }).ToList();

                    // Translate columns as per the language Wise
                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "Name",await _translationService.Translate(userLanguageId, "global.company-name", "Company Name")  },
                        { "Comments",await _translationService.Translate(userLanguageId, "global.comments", "Comments")  },
                        { "ActionedAt",await _translationService.Translate(userLanguageId, "global.approval-date", "Approval Date")  },
                        { "TotalVehicle",await _translationService.Translate(userLanguageId, "global.number-of-vehicles", "Number of Vehicles")  },
                        { "UpdatedAt",await _translationService.Translate(userLanguageId, "global.last-updated", "Last Updated")  },
                        { "Status",await _translationService.Translate(userLanguageId, "global:status", "Status")   },
                    };

                    return ExportType(activeVehicleFleetsExcel, request.ExportType, "ActiveVehicleFleets", userColumnNames);

                case "VehicleFleets":
                    var vehicleFleetsResponse = await Mediator.Send(new GetVehicleFleetRequestsQuery { Search = request.Search, Status = request.FilterType, IsCarrier = request.IsCarrier, ListArchived = request.ListArchived, IsFromExport = true });
                    var vehicleFleetsExcel = vehicleFleetsResponse.Items.Select(u => new
                    {
                        // Select specific columns for export
                        No = u.OrdinalNumber,
                        //Name = u.Name,
                        CreatedAt = ConvertUtcToLocalAndFormat(u.CreatedAt, request.TimeZone, dateFormat),
                        Status = u.Status,
                        Comments = u.Comments,
                        // Add other properties as needed
                    }).ToList();

                    // Translate columns as per the language Wise
                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        //{ "Name",await _translationService.Translate(userLanguageId, "global.company-name", "Company Name")  },
                        { "CreatedAt",await _translationService.Translate(userLanguageId, "global.submission-date", "Submission Date")  },
                        { "Status",await _translationService.Translate(userLanguageId, "global:status", "Status")   },
                        { "Comments",await _translationService.Translate(userLanguageId, "global:comments", "Comments")   },
                    };

                    return ExportType(vehicleFleetsExcel, request.ExportType, "VehicleFleets", userColumnNames);

                case "TransportRequests":
                    var transportRequestsResponse = await Mediator.Send(new GetTransportRequesQuery
                    {
                        Search = request.Search,
                        Status = (TransportRequestStatus?)request.FilterType,
                        IsFromExport = true
                    });

                    var transportRequestsExcel = transportRequestsResponse.Items.Select(u =>
                    {
                        var info = u.TransportInformation?.FirstOrDefault();
                        var pickup = u.TransportPickup?.FirstOrDefault();
                        var delivery = u.TransportDelivery?.FirstOrDefault();

                        // Helper function for formatting times safely
                        string FormatTime(string? time) =>
                            DateTime.TryParse(time, out var parsed)
                                ? parsed.ToString("HH:mm")
                                : string.Empty;

                        // ----- Possible Pick-Up -----
                        string possiblePickup;
                        if (info == null)
                        {
                            possiblePickup = $"{pickup?.City ?? ""}, {pickup?.PostalCode ?? ""}, {pickup?.CountryName ?? ""}";
                        }
                        else if (info?.PickupDateFrom != null && info?.PickupDateTo != null)
                        {
                            var timeFrom = FormatTime(info.PickupTimeFrom);
                            var timeTo = FormatTime(info.PickupTimeTo);

                            possiblePickup =
                                $"{info.PickupDateFrom:dd.MM.yyyy} - {info.PickupDateTo:dd.MM.yyyy}\n" +
                                ((!string.IsNullOrEmpty(timeFrom) || !string.IsNullOrEmpty(timeTo))
                                    ? $" | {timeFrom} - {timeTo}\n"
                                    : string.Empty) +
                                $" | {pickup?.City ?? ""}, {pickup?.PostalCode ?? ""}, {pickup?.CountryName ?? ""}";
                        }
                        else
                        {
                            possiblePickup = $"{pickup?.City ?? ""}, {pickup?.PostalCode ?? ""}, {pickup?.CountryName ?? ""}";
                        }

                        // ----- Requested Delivery -----
                        string requestedDelivery;
                        if (info == null)
                        {
                            requestedDelivery = $"{delivery?.City ?? ""}, {delivery?.PostalCode ?? ""}, {delivery?.CountryName ?? ""}";
                        }
                        else if (info?.DeliveryDateFrom != null && info?.DeliveryDateTo != null)
                        {
                            var timeFrom = FormatTime(info.DeliveryTimeFrom);
                            var timeTo = FormatTime(info.DeliveryTimeTo);

                            requestedDelivery =
                                $"{info.DeliveryDateFrom:dd.MM.yyyy} - {info.DeliveryDateTo:dd.MM.yyyy}\n" +
                                ((!string.IsNullOrEmpty(timeFrom) || !string.IsNullOrEmpty(timeTo))
                                    ? $" | {timeFrom} - {timeTo}\n"
                                    : string.Empty) +
                                $" | {delivery?.City ?? ""}, {delivery?.PostalCode ?? ""}, {delivery?.CountryName ?? ""}";
                        }
                        else
                        {
                            requestedDelivery = $"{delivery?.City ?? ""}, {delivery?.PostalCode ?? ""}, {delivery?.CountryName ?? ""}";
                        }

                        return new
                        {
                            RequestID = u.RequestId,
                            PossiblePickUp = possiblePickup,
                            RequestedDelivery = requestedDelivery,
                            TotalDistance = u.TotalDistance,
                            Goods = u.TransportGoods.FirstOrDefault()?.TypeOfGoodsName,
                            Status = u.StatusDesc,
                            LowestPrice = u.LowestPrice,
                            Offers = u.OfferCount,
                        };
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "RequestID", await _translationService.Translate(userLanguageId, "global.request-id", "Request ID") },
                        { "PossiblePickUp", await _translationService.Translate(userLanguageId, "global.pickup-date-location", "Pickup Date & Location") },
                        { "RequestedDelivery", await _translationService.Translate(userLanguageId, "global.requested-delivery-location", "Delivery Date & Location") },
                        { "TotalDistance", await _translationService.Translate(userLanguageId, "global.total-distance", "Total Distance") },
                        { "Goods", await _translationService.Translate(userLanguageId, "global.goods", "Goods") },
                        { "Status", await _translationService.Translate(userLanguageId, "global.status", "Status") },
                        { "LowestPrice", await _translationService.Translate(userLanguageId, "global.lowest-price", "Lowest Price") },
                        { "Offers", await _translationService.Translate(userLanguageId, "global.offers", "Offers") },
                    };

                    return ExportType(transportRequestsExcel, request.ExportType, "TransportRequests", userColumnNames);



                case "ManageTransportRequests":
                    var managetransportRequestsResponse = await Mediator.Send(new GetTransportRequesQuery
                    {
                        Search = request.Search,
                        Status = (TransportRequestStatus?)request.FilterType,
                        IsFromExport = true
                    });

                    var managetransportRequestsExcel = managetransportRequestsResponse.Items.Select(u =>
                    {
                        var info = u.TransportInformation?.FirstOrDefault();
                        var pickup = u.TransportPickup?.FirstOrDefault();
                        var delivery = u.TransportDelivery?.FirstOrDefault();

                        // Helper function for formatting times safely
                        string FormatTime(string? time) =>
                            DateTime.TryParse(time, out var parsed)
                                ? parsed.ToString("HH:mm")
                                : string.Empty;

                        // ----- Possible Pick-Up -----
                        string possiblePickup;
                        if (info == null)
                        {
                            possiblePickup = $"{pickup?.City ?? ""}, {pickup?.PostalCode ?? ""}, {pickup?.CountryName ?? ""}";
                        }
                        else if (info?.PickupDateFrom != null && info?.PickupDateTo != null)
                        {
                            var timeFrom = FormatTime(info.PickupTimeFrom);
                            var timeTo = FormatTime(info.PickupTimeTo);

                            possiblePickup =
                                $"{info.PickupDateFrom:dd.MM.yyyy} - {info.PickupDateTo:dd.MM.yyyy}\n" +
                                ((!string.IsNullOrEmpty(timeFrom) || !string.IsNullOrEmpty(timeTo))
                                    ? $" | {timeFrom} - {timeTo}\n"
                                    : string.Empty) +
                                $" | {pickup?.City ?? ""}, {pickup?.PostalCode ?? ""}, {pickup?.CountryName ?? ""}";
                        }
                        else
                        {
                            possiblePickup = $"{pickup?.City ?? ""}, {pickup?.PostalCode ?? ""}, {pickup?.CountryName ?? ""}";
                        }

                        // ----- Requested Delivery -----
                        string requestedDelivery;
                        if (info == null)
                        {
                            requestedDelivery = $"{delivery?.City ?? ""}, {delivery?.PostalCode ?? ""}, {delivery?.CountryName ?? ""}";
                        }
                        else if (info?.DeliveryDateFrom != null && info?.DeliveryDateTo != null)
                        {
                            var timeFrom = FormatTime(info.DeliveryTimeFrom);
                            var timeTo = FormatTime(info.DeliveryTimeTo);

                            requestedDelivery =
                                $"{info.DeliveryDateFrom:dd.MM.yyyy} - {info.DeliveryDateTo:dd.MM.yyyy}\n" +
                                ((!string.IsNullOrEmpty(timeFrom) || !string.IsNullOrEmpty(timeTo))
                                    ? $" | {timeFrom} - {timeTo}\n"
                                    : string.Empty) +
                                $" | {delivery?.City ?? ""}, {delivery?.PostalCode ?? ""}, {delivery?.CountryName ?? ""}";
                        }
                        else
                        {
                            requestedDelivery = $"{delivery?.City ?? ""}, {delivery?.PostalCode ?? ""}, {delivery?.CountryName ?? ""}";
                        }

                        return new
                        {
                            RequestID = u.RequestId,
                            ShipperName = u.ShipperName,
                            PossiblePickUp = possiblePickup,
                            RequestedDelivery = requestedDelivery,
                            TotalDistance = u.TotalDistance,
                            Goods = u.TransportGoods.FirstOrDefault()?.TypeOfGoodsName,
                            Status = u.StatusDesc,
                            InvitedCarriers = u.CarrierCount,
                            Offers = u.OfferCount,
                        };
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "RequestID", await _translationService.Translate(userLanguageId, "global.request-id", "Request ID") },
                        { "ShipperName", await _translationService.Translate(userLanguageId, "global.shipper-name", "Shipper Name") },
                        { "PossiblePickUp", await _translationService.Translate(userLanguageId, "global.Estimated-Pick-Up", "Estimated Pick-Up") },
                        { "RequestedDelivery", await _translationService.Translate(userLanguageId, "global.delivery", "Delivery") },
                        { "TotalDistance", await _translationService.Translate(userLanguageId, "global.total-distance", "Total Distance") },
                        { "Goods", await _translationService.Translate(userLanguageId, "global.goods", "Goods") },
                        { "Status", await _translationService.Translate(userLanguageId, "global.status", "Status") },
                        { "InvitedCarriers", await _translationService.Translate(userLanguageId, "global.invited-carriers", "Invited Carriers") },
                        { "Offers", await _translationService.Translate(userLanguageId, "global.offers", "Offers") },
                    };

                    return ExportType(managetransportRequestsExcel, request.ExportType, "ManageTransportRequests", userColumnNames);


                case "ArchivedRequests":
                    var transportArchivedRequestsResponse = await Mediator.Send(new GetCarrierTransportRequesQuery
                    {
                        Search = request.Search,
                        Status = (TransportCarrierStatus?)request.FilterType,
                        ListArchived = true,
                        IsFromExport = true
                    });

                    var transportArchivedRequestsExcel = transportArchivedRequestsResponse.Items.Select(u =>
                    {
                        var info = u.TransportInformation?.FirstOrDefault();
                        var pickup = u.TransportPickup?.FirstOrDefault();
                        var delivery = u.TransportDelivery?.FirstOrDefault();
                        var goods = u.TransportGoods?.FirstOrDefault();

                        // Helper function for formatting times safely
                        string FormatTime(string? time) =>
                            DateTime.TryParse(time, out var parsed)
                                ? parsed.ToString("HH:mm")
                                : string.Empty;

                        // ----- Possible Pick-Up -----
                        string possiblePickup;
                        if (info == null)
                        {
                            possiblePickup = $"{pickup?.City ?? ""}, {pickup?.PostalCode ?? ""}, {pickup?.CountryName ?? ""}";
                        }
                        else if (info?.PickupDateFrom != null && info?.PickupDateTo != null)
                        {
                            var timeFrom = FormatTime(info.PickupTimeFrom);
                            var timeTo = FormatTime(info.PickupTimeTo);

                            possiblePickup =
                                $"{info.PickupDateFrom:dd.MM.yyyy} - {info.PickupDateTo:dd.MM.yyyy}\n" +
                                ((!string.IsNullOrEmpty(timeFrom) || !string.IsNullOrEmpty(timeTo))
                                    ? $" | {timeFrom} - {timeTo}\n"
                                    : string.Empty) +
                                $" | {pickup?.City ?? ""}, {pickup?.PostalCode ?? ""}, {pickup?.CountryName ?? ""}";
                        }
                        else
                        {
                            possiblePickup = $"{pickup?.City ?? ""}, {pickup?.PostalCode ?? ""}, {pickup?.CountryName ?? ""}";
                        }

                        // ----- Requested Delivery -----
                        string requestedDelivery;
                        if (info == null)
                        {
                            requestedDelivery = $"{delivery?.City ?? ""}, {delivery?.PostalCode ?? ""}, {delivery?.CountryName ?? ""}";
                        }
                        else if (info?.DeliveryDateFrom != null && info?.DeliveryDateTo != null)
                        {
                            var timeFrom = FormatTime(info.DeliveryTimeFrom);
                            var timeTo = FormatTime(info.DeliveryTimeTo);

                            requestedDelivery =
                                $"{info.DeliveryDateFrom:dd.MM.yyyy} - {info.DeliveryDateTo:dd.MM.yyyy}\n" +
                                ((!string.IsNullOrEmpty(timeFrom) || !string.IsNullOrEmpty(timeTo))
                                    ? $" | {timeFrom} - {timeTo}\n"
                                    : string.Empty) +
                                $" | {delivery?.City ?? ""}, {delivery?.PostalCode ?? ""}, {delivery?.CountryName ?? ""}";
                        }
                        else
                        {
                            requestedDelivery = $"{delivery?.City ?? ""}, {delivery?.PostalCode ?? ""}, {delivery?.CountryName ?? ""}";
                        }

                        // ----- Cargo -----
                        string cargo = goods != null
                            ? $"Qty: {(goods.Quantity.ToString() ?? "0")}, " +
                              $"L:{(goods.Length.ToString("0.##") ?? "0")} " +
                              $"W:{(goods.Width.ToString("0.##") ?? "0")} " +
                              $"H:{(goods.Height.ToString("0.##") ?? "0")} " +
                              $"Kg:{(goods.Weight.ToString("0.##") ?? "0")}"
                            : string.Empty;



                        return new
                        {
                            RequestID = u.RequestId,
                            PossiblePickUp = possiblePickup,
                            RequestedDelivery = requestedDelivery,
                            Cargo = cargo,
                            Price = u.TransportCarrier.FirstOrDefault()?.Price,
                            Status = u.StatusDesc,
                        };
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "RequestID", await _translationService.Translate(userLanguageId, "global.request-id", "Request ID") },
                        { "PossiblePickUp", await _translationService.Translate(userLanguageId, "global.pickup-date-location", "Pickup Date & Location") },
                        { "RequestedDelivery", await _translationService.Translate(userLanguageId, "global.requested-delivery-location", "Delivery Date & Location") },
                        { "Cargo", await _translationService.Translate(userLanguageId, "global.cargo", "Cargo") },
                        { "Price", await _translationService.Translate(userLanguageId, "global.my-price", "My Price") },
                        { "Status", await _translationService.Translate(userLanguageId, "global.status", "Status") },
                    };

                    return ExportType(transportArchivedRequestsExcel, request.ExportType, "TransportRequests", userColumnNames);

                case "TransportTemplates":
                    var transportTemplatesResponse = await Mediator.Send(new GetTransportTemplateQuery { Search = request.Search, IsFromExport = true });
                    var transportTemplatesExcel = transportTemplatesResponse.Items.Select(u => new
                    {
                        // Select specific columns for export
                        No = u.OrdinalNumber,
                        TemplateName = u.TemplateName,
                        TypeOfGoodsName = u.TransportGoods.FirstOrDefault().TypeOfGoodsName,
                        PickupDeliveryAddresses =
                        $"{u.TransportPickup.FirstOrDefault()?.City}, {u.TransportPickup.FirstOrDefault()?.CountryName} → " +
                        $"{u.TransportDelivery.FirstOrDefault()?.City}, {u.TransportDelivery.FirstOrDefault()?.CountryName}",
                        CreatedAt = ConvertUtcToLocalAndFormat(u.CreatedAt, request.TimeZone, dateFormat),

                    }).ToList();

                    // Translate columns as per the language Wise
                    userColumnNames = new Dictionary<string, string>
                    {
                       { "No", await _translationService.Translate(userLanguageId, "global.no", "No") },
                       { "TemplateName", await _translationService.Translate(userLanguageId, "global.template-name", "Template Name") },
                       { "TypeOfGoodsName", await _translationService.Translate(userLanguageId, "global.type-of-goods", "Type Of Goods") },
                       { "PickupDeliveryAddresses", await _translationService.Translate(userLanguageId, "global.pickup-delivery-addresses", "Pickup → Delivery (Addresses)") },
                       { "CreatedAt", await _translationService.Translate(userLanguageId, "global.created-date", "Date Created") },
                    };

                    return ExportType(transportTemplatesExcel, request.ExportType, "TransportTemplates", userColumnNames);


                case "Branches":
                    var branchesResponse = await Mediator.Send(new GetCompanyBranchesQuery { Search = request.Search, MunicipalityId = request.MunicipalityId, EntityId = request.EntityId, IsFromExport = true });
                    var branchesExcel = branchesResponse.Items.Select(u => new
                    {
                        // Select specific columns for export
                        No = u.OrdinalNumber,
                        BranchOfficeName = u.BranchOfficeName,
                        IdNumber = u.IdNumber,
                        Address = u.Address,
                        Place = u.Place,
                        Municipality = u.Municipality,
                        Email = u.Email,
                        ContactPerson = u.ContactPerson,
                        ContactPhone = u.ContactPhone
                        // Add other properties as needed
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "BranchOfficeName",await _translationService.Translate(userLanguageId, "branch.office.name", "BranchOfficeName")  },
                        { "IdNumber",await _translationService.Translate(userLanguageId, "branch.office.IdNumber", "IdNumber")  },
                        { "Address",await _translationService.Translate(userLanguageId, "branch.office.Address", "Address")   },
                        { "Municipality",await _translationService.Translate(userLanguageId, "global.municipality", "Municipality")   },
                        { "Email",await _translationService.Translate(userLanguageId, "branch.office.email", "Email")   },
                        { "ContactPerson",await _translationService.Translate(userLanguageId, "branch.office.contactPerson", "ContactPerson")   },
                        { "ContactPhone",await _translationService.Translate(userLanguageId, "branch.office.contactPhone", "ContactPhone")   },
                        { "Place",await _translationService.Translate(userLanguageId, "branch.office.place", "Place")  },
                    };

                    return ExportType(branchesExcel, request.ExportType, "Company Branches", userColumnNames);

                case "Codebook":
                    var codebookResponse = await Mediator.Send(new GetCodebooksByTypeQuery { Search = request.Search, Type = (CodebookTypeEnum)request.FilterType, IsFromExport = true });
                    var codebookExcel = codebookResponse.Items.Select(u => new
                    {
                        // Select specific columns for export
                        No = u.OrdinalNumber,
                        Name = u.Name
                        // Add other properties as needed
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "Name",await _translationService.Translate(userLanguageId, "global.name", "Name")  }
                    };


                    CodebookTypeEnum type = (CodebookTypeEnum)request.FilterType;
                    string codebookType = type.ToString(); // "Country", "TrailerType", etc.

                    return ExportType(codebookExcel, request.ExportType, codebookType, userColumnNames);

                case "Refrigerant":
                    var refrigerantResponse = await Mediator.Send(new GetRefrigerantTypesQuery { Search = request.Search, IsFromExport = true });
                    var refrigerantExcel = refrigerantResponse.Items.Select(u => new
                    {
                        // Select specific columns for export
                        No = u.OrdinalNumber,
                        Name = u.Name,
                        ASHRAEDesignation = u.ASHRAEDesignation,
                        TypeOfCoolingFluid = u.TypeOfCoolingFluid,
                        GlobalWarmingPotential = u.GlobalWarmingPotential,
                        // Add other properties as needed
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "Name",await _translationService.Translate(userLanguageId, "global.name", "Name")  },
                        { "ASHRAEDesignation",await _translationService.Translate(userLanguageId, "refrigerant:ashraeDesignation", "ASHRAEDesignation")  },
                        { "TypeOfCoolingFluid",await _translationService.Translate(userLanguageId, "refrigerant:typeOfCoolingFluid", "TypeOfCoolingFluid")   },
                        { "GlobalWarmingPotential",await _translationService.Translate(userLanguageId, "refrigerant:globalWarmingPotential", "GlobalWarmingPotential") },
                    };

                    return ExportType(refrigerantExcel, request.ExportType, "Refrigerant", userColumnNames);

                case "Municipalities":
                    var municipalitiesResponse = await Mediator.Send(new GetAllMunicipalitiesQuery { Search = request.Search, IsFromExport = true });
                    var municipalitiesExcel = municipalitiesResponse.Items.Select(u => new
                    {
                        // Select specific columns for export
                        No = u.OrdinalNumber,
                        Name = u.Name,
                        CantonName = u.CantonName,
                        EntityName = u.EntityName
                        // Add other properties as needed
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "Name",await _translationService.Translate(userLanguageId, "global.name", "Name")  },
                        { "CantonName",await _translationService.Translate(userLanguageId, "global:canton", "CantonName")  },
                        { "EntityName",await _translationService.Translate(userLanguageId, "global:entity", "EntityName")   }
                    };

                    return ExportType(municipalitiesExcel, request.ExportType, "Municipalities", userColumnNames);

                case "Cantons":
                    var cantonsResponse = await Mediator.Send(new GetAllCantonsQuery { Search = request.Search, IsFromExport = true });
                    var cantonsExcel = cantonsResponse.Items.Select(u => new
                    {
                        // Select specific columns for export
                        No = u.OrdinalNumber,
                        Name = u.Name,
                        EntityName = u.EntityName
                        // Add other properties as needed
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "Name",await _translationService.Translate(userLanguageId, "global.name", "Name")  },
                        { "EntityName",await _translationService.Translate(userLanguageId, "global:entity", "EntityName")   }
                    };

                    return ExportType(cantonsExcel, request.ExportType, "Cantons", userColumnNames);

                case "Entities":
                    var entitiesResponse = await Mediator.Send(new GetAllStateEntitiesQuery { Search = request.Search, IsFromExport = true });
                    var entitiesExcel = entitiesResponse.Items.Select(u => new
                    {
                        // Select specific columns for export
                        No = u.OrdinalNumber,
                        Name = u.Name,
                        // Add other properties as needed
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "Name",await _translationService.Translate(userLanguageId, "global.name", "Name")  }
                    };

                    return ExportType(entitiesExcel, request.ExportType, "Entities", userColumnNames);

                case "Request":
                    var requestResponse = await Mediator.Send(new GetRequestsQuery { Search = request.Search, Type = (RequestType)request.FilterType, ListArchived = request.ListArchived, IsFromExport = true });
                    var requestExcel = requestResponse.Items.Select(u => new
                    {
                        // Select specific columns for export
                        //No = u.OrdinalNumber,
                        RequestId = u.RequestId,
                        Date = ConvertUtcToLocalAndFormat(u.CreatedAt, request.TimeZone, dateFormat),
                        Name = u.Name,
                        //Municipality = u.Municipality,
                        RequestType = u.RequestTypeDesc,
                        Status = u.StatusDesc
                        // Add other properties as needed
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        //{ "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "RequestId",await _translationService.Translate(userLanguageId, "requests:details.register-id", "Request Id")  },
                        { "Date",await _translationService.Translate(userLanguageId, "requests:table.sate-of-submission", "Date of Submission")  },
                        { "Name",await _translationService.Translate(userLanguageId, "global.company-name", "Company name")  },
                        //{ "Municipality",await _translationService.Translate(userLanguageId, "global.municipality", "Municipality")  },
                        { "RequestType",await _translationService.Translate(userLanguageId, "requests:details.company-type", "Company Type")  },
                        { "Status",await _translationService.Translate(userLanguageId, "global.status", "Status")  }
                    };

                    return ExportType(requestExcel, request.ExportType, "Request", userColumnNames);

                case "owners-operators":
                    var ownersoperatorsResponse = await Mediator.Send(new GetOwnersOperatorsOfEquipmentsQuery { Search = request.Search, MunicipalityId = request.MunicipalityId, IsFromExport = true });
                    var ownersoperatorsExcel = ownersoperatorsResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        CompanyName = u.CompanyName,
                        Municipality = u.Municipality,
                        NrOfBranches = u.NrOfBranches,
                        NrOfEquipments = u.NrOfEquipments
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "CompanyName",await _translationService.Translate(userLanguageId, "requests:create.company-name", "CompanyName")  },
                        { "Municipality",await _translationService.Translate(userLanguageId, "global.municipality", "Municipality")  },
                        { "NrOfBranches",await _translationService.Translate(userLanguageId, "register:nrOfBranches", "NrOfBranches")  },
                        { "NrOfEquipments",await _translationService.Translate(userLanguageId, "register:nrOfEquipments", "NrOfEquipments")  }
                    };

                    return ExportType(ownersoperatorsExcel, request.ExportType, "owners-operators", userColumnNames);

                case "marked-equipments":
                    var markedequipmentsResponse = await Mediator.Send(new GetMarkedEquipmentsQuery { Search = request.Search, MunicipalityId = request.MunicipalityId, TypeOfEquipmentId = request.TypeOfEquipmentId, IsFromExport = true });
                    var markedequipmentsExcel = markedequipmentsResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        EquipmentIdNumber = u.EquipmentIdNumber,
                        TypeOfEquipment = u.TypeOfEquipment,
                        OwnerCompany = u.OwnerCompany,
                        Municipality = u.Municipality,
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "EquipmentIdNumber",await _translationService.Translate(userLanguageId, "register:equipment-id-number", "EquipmentIdNumber")  },
                        { "TypeOfEquipment",await _translationService.Translate(userLanguageId, "register:type-of-equipment", "TypeOfEquipment")  },
                        { "OwnerCompany",await _translationService.Translate(userLanguageId, "register:owner-company", "OwnerCompany")  },
                        { "Municipality",await _translationService.Translate(userLanguageId, "global.municipality", "Municipality")  }
                    };

                    return ExportType(markedequipmentsExcel, request.ExportType, "marked-equipments", userColumnNames);

                case "dlp-service-companies":
                    var kghservicecompaniesResponse = await Mediator.Send(new GetKGHServiceCompaniesQuery { Search = request.Search, MunicipalityId = request.MunicipalityId, Type = (OrganizationTypeEnum)request.FilterType, IsFromExport = true });
                    var kghservicecompaniesExcel = kghservicecompaniesResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        CompanyName = u.CompanyName,
                        Municipality = u.Municipality,
                        LicenseId = u.LicenseId,
                        LicenseDuration = u.LicenseDuration,
                        Status = u.StatusDesc,
                        NrOfCertifiedServiceTechnicians = u.NrOfCertifiedServiceTechnicians,
                        CompanyType = u.CompanyType

                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "CompanyName",await _translationService.Translate(userLanguageId, "register:companyName", "Company Name")  },
                        { "Municipality",await _translationService.Translate(userLanguageId, "global.municipality", "Municipality")  },
                        { "LicenseId",await _translationService.Translate(userLanguageId, "register:licenseId", "License Id")  },
                        { "LicenseDuration",await _translationService.Translate(userLanguageId, "register:LicenseDuration", "License Duration")  },
                        { "Status",await _translationService.Translate(userLanguageId, "requests:details.status", "Status")  },
                        { "NrOfCertifiedServiceTechnicians",await _translationService.Translate(userLanguageId, "register:nrOfCertifiedServiceTechnicians", "Certified Service Technicians")  },
                        { "CompanyType",await _translationService.Translate(userLanguageId, "requests:details.company-type", "Company Type")  }

                    };

                    return ExportType(kghservicecompaniesExcel, request.ExportType, "dlp-service-companies", userColumnNames);

                case "CertifiedTechnicians":
                    var certifiedTechniciansResponse = await Mediator.Send(new GetCertifiedTechniciansQuery { Search = request.Search, FilterType = (UserFilterType)request.FilterType, IsFromExport = true });
                    var certifiedTechniciansExcel = certifiedTechniciansResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        FullName = u.FirstName + " " + u.LastName,
                        Municipality = u.Municipality,
                        TrainingCenter = u.TrainingCenter,
                        CurrentQualification = u.CurrentQualification,
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "FullName",await _translationService.Translate(userLanguageId, "certified-technicians:table.title.fullname", "FullName")  },
                        { "Municipality",await _translationService.Translate(userLanguageId, "global.municipality", "Municipality")  },
                        { "TrainingCenter",await _translationService.Translate(userLanguageId, "certified-technicians:table.title.training-center", "TrainingCenter")  },
                        { "CurrentQualification",await _translationService.Translate(userLanguageId, "certified-technicians:table.title.current-qualification", "CurrentQualification")  }
                    };

                    return ExportType(certifiedTechniciansExcel, request.ExportType, "CertifiedTechnicians", userColumnNames);

                case "importers-exporters":
                    var importersexportersResponse = await Mediator.Send(new GetImportersExportersCompaniesQuery { Search = request.Search, MunicipalityId = request.MunicipalityId, Type = request.FilterType != 0 ? (OrganizationTypeEnum)request.FilterType : null, IsFromExport = true });
                    var importersexportersExcel = importersexportersResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        CompanyName = u.CompanyName,
                        Municipality = u.Municipality,
                        CompanyType = u.CompanyType,
                        LicenseId = u.LicenseId,
                        LicenseDuration = u.LicenseDuration,
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "CompanyName",await _translationService.Translate(userLanguageId, "register:companyName", "CompanyName")  },
                        { "Municipality",await _translationService.Translate(userLanguageId, "global.municipality", "Municipality")  },
                        { "CompanyType",await _translationService.Translate(userLanguageId, "register:companyType", "CompanyType")  },
                        { "LicenseId",await _translationService.Translate(userLanguageId, "register:licenseId", "LicenseId")  },
                        { "LicenseDuration",await _translationService.Translate(userLanguageId, "global:license-duration", "LicenseDuration")  }
                    };

                    return ExportType(importersexportersExcel, request.ExportType, "importers-exporters", userColumnNames);

                case "Equipments":
                    var equipmentsResponse = await Mediator.Send(new GetEquipmentsQuery { Search = request.Search, IsArchived = request.ListArchived, IsFromExport = true });
                    var equipmentsExcel = equipmentsResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        BranchOfficeName = u.BranchOfficeName,
                        TypeOfEquipment = u.TypeOfEquipment,
                        Manufacturer = u.Manufacturer,
                        SerialNumber = u.SerialNumber,
                        Type = u.Type,
                        DateOfPurchase = u.DateOfPurchase,
                        Model = u.Model,
                        YearOfProduction = u.YearOfProduction,
                        RefrigerantType = u.RefrigerantType,
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "BranchOfficeName",await _translationService.Translate(userLanguageId, "equipments:table.title.branchOfficeName", "BranchOfficeName")  },
                        { "TypeOfEquipment",await _translationService.Translate(userLanguageId, "equipments:table.title.typeOfEquipment", "TypeOfEquipment")  },
                        { "Manufacturer",await _translationService.Translate(userLanguageId, "equipments:table.title.manufacturer", "Manufacturer")  },
                        { "SerialNumber",await _translationService.Translate(userLanguageId, "equipments:table.title.serialNumber", "SerialNumber")  },
                        { "Type",await _translationService.Translate(userLanguageId, "equipments:table.title.type", "Type")  },
                        { "DateOfPurchase",await _translationService.Translate(userLanguageId, "equipments:table.title.dataOfPurchase", "DateOfPurchase")  },
                        { "Model",await _translationService.Translate(userLanguageId, "equipments:table.title.model", "Model")  },
                        { "YearOfProduction",await _translationService.Translate(userLanguageId, "equipments:table.title.yearOfProduction", "YearOfProductionType")  },
                        { "RefrigerantType",await _translationService.Translate(userLanguageId, "equipments:table.title.refrigerantType", "RefrigerantType")  }
                    };

                    return ExportType(equipmentsExcel, request.ExportType, "Equipments", userColumnNames);

                case "technicians-by-training-center":
                    var techniciansbytrainingcenterResponse = await Mediator.Send(new GetTotalCertifiedTechniciansByTrainingCenterQuery { From = request.From, To = request.To, IsFromExport = true });
                    var techniciansbytrainingcenterResponseExcel = techniciansbytrainingcenterResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        TreningCenter = u.Name,
                        Total = u.Total,
                        StateEntityId = u.StateEntityId,
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "TreningCenter",await _translationService.Translate(userLanguageId, "certified-technicians:table.title.training-center", "TreningCenter")  },
                        { "Total",await _translationService.Translate(userLanguageId, "global.total", "Total")  },
                        { "StateEntityId",await _translationService.Translate(userLanguageId, "reports:stateEntityId", "StateEntityId")  }
                    };

                    return ExportType(techniciansbytrainingcenterResponseExcel, request.ExportType, "technicians-by-training-center", userColumnNames);

                case "technicians-by-qualifications":
                    var techniciansbyqualificationsResponse = await Mediator.Send(new GetTotalCertifiedTechniciansByQualificationQuery { From = request.From, To = request.To, IsFromExport = true });
                    var techniciansbyqualificationsResponseExcel = techniciansbyqualificationsResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        Qualifications = u.Name,
                        Total = u.Total,
                        StateEntityId = u.StateEntityId,
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "Qualifications",await _translationService.Translate(userLanguageId, "reports:qualification", "Qualifications")  },
                        { "Total",await _translationService.Translate(userLanguageId, "global.total", "Total")  },
                        { "StateEntityId",await _translationService.Translate(userLanguageId, "reports:stateEntityId", "StateEntityId")  }
                    };

                    return ExportType(techniciansbyqualificationsResponseExcel, request.ExportType, "technicians-by-qualifications", userColumnNames);

                case "technicians-by-entity":
                    var techniciansbyentityResponse = await Mediator.Send(new GetTotalCertifiedTechniciansByEntityQuery { From = request.From, To = request.To, IsFromExport = true });
                    var techniciansbyentityResponseExcel = techniciansbyentityResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        Entity = u.Name,
                        Total = u.Total,
                        StateEntityId = u.StateEntityId,
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "Entity",await _translationService.Translate(userLanguageId, "reports:entity", "Entity")  },
                        { "Total",await _translationService.Translate(userLanguageId, "global.total", "Total")  },
                        { "StateEntityId",await _translationService.Translate(userLanguageId, "reports:stateEntityId", "StateEntityId")  }
                    };

                    return ExportType(techniciansbyentityResponseExcel, request.ExportType, "technicians-by-entity", userColumnNames);

                case "equipments-by-municipality":
                    var equipmentsbymunicipalityResponse = await Mediator.Send(new GetTotalEquipmentByMunicipalityQuery { From = request.From, To = request.To, IsFromExport = true });
                    var equipmentsbymunicipalityResponseExcel = equipmentsbymunicipalityResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        Municipality = u.Name,
                        Total = u.Total,
                        StateEntityId = u.StateEntityId,
                    }).ToList();


                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "Municipality",await _translationService.Translate(userLanguageId, "global.municipality", "Municipality")  },
                        { "Total",await _translationService.Translate(userLanguageId, "global.total", "Total")  },
                        { "StateEntityId",await _translationService.Translate(userLanguageId, "reports:stateEntityId", "StateEntityId")  }
                    };

                    return ExportType(equipmentsbymunicipalityResponseExcel, request.ExportType, "equipments-by-municipality", userColumnNames);

                case "equipments-by-purpose":
                    var equipmentsbypurposeResponse = await Mediator.Send(new GetTotalEquipmentByPurposeQuery { From = request.From, To = request.To, IsFromExport = true });
                    var equipmentsbypurposeResponseExcel = equipmentsbypurposeResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        EquipmentPurpose = u.Name,
                        Total = u.Total,
                        StateEntityId = u.StateEntityId,
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "EquipmentPurpose",await _translationService.Translate(userLanguageId, "reports:equipment-purpose", "EquipmentPurpose")  },
                        { "Total",await _translationService.Translate(userLanguageId, "global.total", "Total")  },
                        { "StateEntityId",await _translationService.Translate(userLanguageId, "reports:stateEntityId", "StateEntityId")  }
                    };

                    return ExportType(equipmentsbypurposeResponseExcel, request.ExportType, "equipments-by-purpose", userColumnNames);

                case "equipments-by-cooling-system":
                    var equipmentsbycoolingsystemResponse = await Mediator.Send(new GetTotalEquipmentByCoolingSystemQuery { From = request.From, To = request.To, IsFromExport = true });
                    var equipmentsbycoolingsystemResponseExcel = equipmentsbycoolingsystemResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        CoolingSystem = u.Name,
                        Total = u.Total,
                        StateEntityId = u.StateEntityId,
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "CoolingSystem",await _translationService.Translate(userLanguageId, "reports:cooling-system", "CoolingSystem")  },
                        { "Total",await _translationService.Translate(userLanguageId, "global.total", "Total")  },
                        { "StateEntityId",await _translationService.Translate(userLanguageId, "reports:stateEntityId", "StateEntityId")  }
                    };

                    return ExportType(equipmentsbycoolingsystemResponseExcel, request.ExportType, "equipments-by-cooling-system", userColumnNames);

                case "companies-by-entity":
                    var companiesbyentityResponse = await Mediator.Send(new GetTotalCompaniesByEntityQuery { From = request.From, To = request.To, IsFromExport = true });
                    var companiesbyentityResponseExcel = companiesbyentityResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        Entity = u.Name,
                        Type = u.Type,
                        Total = u.Total,
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "Entity",await _translationService.Translate(userLanguageId, "reports:entity", "Entity")  },
                        { "Type",await _translationService.Translate(userLanguageId, "equipments:type-placeholder", "Type")  },
                        { "Total",await _translationService.Translate(userLanguageId, "global.total", "Total")  }

                    };

                    return ExportType(companiesbyentityResponseExcel, request.ExportType, "companies-by-entity", userColumnNames);

                case "refrigerants-by-entity":
                    var refrigerantsByEntityResponse = await Mediator.Send(new GetRefrigerantQuantityByTypeAndStateEntityQuery { From = request.From, To = request.To, IsFromExport = true });
                    var refrigerantsByEntityResponseExcel = refrigerantsByEntityResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        RefrigerantName = u.Name,
                        Quantity = u.Quantity,
                        StateEntity = u.StateEntityName,
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "RefrigerantName",await _translationService.Translate(userLanguageId, "reports:refrigerant-by-entity", "RefrigerantName")  },
                        { "Quantity",await _translationService.Translate(userLanguageId, "reports:quantity", "Quantity")  },
                        { "StateEntity",await _translationService.Translate(userLanguageId, "reports:stateEntity", "StateEntity")  }
                    };

                    return ExportType(refrigerantsByEntityResponseExcel, request.ExportType, "refrigerants-by-entity", userColumnNames);

                case "service-companies":
                    var serviceCompaniesResponse = await Mediator.Send(new GetServiceCompaniesByEntityQuery { From = request.From ?? DateTime.Now.AddDays(-365), To = request.To ?? DateTime.Now, IsFromExport = true });
                    var serviceCompaniesResponseExcel = serviceCompaniesResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        Entity = u.Name,
                        Type = u.Type,
                        Total = u.Total,
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "Entity",await _translationService.Translate(userLanguageId, "reports:entity", "Entity")  },
                        { "Type",await _translationService.Translate(userLanguageId, "reports:type", "Type")  },
                        { "Total",await _translationService.Translate(userLanguageId, "global.total", "Total")  }
                    };

                    return ExportType(serviceCompaniesResponseExcel, request.ExportType, "service-companies", userColumnNames);

                case "Logs":
                    var logsResponse = await Mediator.Send(new GetActivityLogsQuery { FullName = request.Search, LogType = request.FilterType, IsFromExport = true });
                    var logsExcel = logsResponse.Items.Select(u => new
                    {
                        // Select specific columns for export
                        No = u.OrdinalNumber,
                        User = u.User,
                        IPAddress = u.IP,
                        DateTime = u.Date,
                        LogType = u.LogType,
                        Activity = u.Activity,
                        // Add other properties as needed
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "User",await _translationService.Translate(userLanguageId, "global.User", "User")  },
                        { "IPAddress",await _translationService.Translate(userLanguageId, "logs.ip-address", "IPAddress")  },
                        { "DateTime",await _translationService.Translate(userLanguageId, "logs.date-time", "DateTime")  },
                        { "LogType",await _translationService.Translate(userLanguageId, "logs.log-type", "LogType")  },
                        { "Activity",await _translationService.Translate(userLanguageId, "logs.activity", "Activity")  }
                    };

                    return ExportType(logsExcel, request.ExportType, "Logs", userColumnNames);

                case "MVTEO Annual Report On Collected Substances":
                    var MVTEOAnnualResponse = await _mediator.Send(new GetServiceTechnicianReportSummaryQuery { Search = request.Search, IsFromExport = true });
                    var MVTEOAnnualExcel = MVTEOAnnualResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        NameOfSubstance = u.RefrigerantTypeName,
                        ChemicalFormula = u.RefrigerantTypeChemicalFormula,
                        Symbol = u.RefrigerantTypeASHRAEDesignation,
                        Purchased = Math.Round(u.TotalPurchased, 3),
                        Collected = Math.Round(u.TotalCollected, 3),
                        Renewed = Math.Round(u.TotalRenewed, 3),
                        Sold = Math.Round(u.TotalSold, 3),
                        TotalUsed1 = Math.Round(u.TotalUsed1, 3),
                        TotalUsed2 = Math.Round(u.TotalUsed2, 3),
                        TotalUsed3 = Math.Round(u.TotalUsed3, 3),
                        TotalUsed4 = Math.Round(u.TotalUsed4, 3),
                        StockBalance = Math.Round(u.TotalStockBalance, 3)
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "reports.ordinalNumber", "No") },
                        { "NameOfSubstance",await _translationService.Translate(userLanguageId, "global.name-of-substance-mixture", "NameOfSubstance")  },
                        { "ChemicalFormula",await _translationService.Translate(userLanguageId, "global.chemical-formula", "ChemicalFormula")  },
                        { "Symbol",await _translationService.Translate(userLanguageId, "global.symbol", "Symbol")  },
                        { "Purchased",await _translationService.Translate(userLanguageId, "global.purchased-acquired", "Purchased")  },
                        { "Collected",await _translationService.Translate(userLanguageId, "global.collected", "Collected")  },
                        { "Renewed",await _translationService.Translate(userLanguageId, "global.renewed", "Renewed")  },
                        { "Sold",await _translationService.Translate(userLanguageId, "global.Sold", "Sold")  },
                        { "TotalUsed1",await _translationService.Translate(userLanguageId, "global.used-1", "TotalUsed1")  },
                        { "TotalUsed2",await _translationService.Translate(userLanguageId, "global.used-2", "TotalUsed2")  },
                        { "TotalUsed3",await _translationService.Translate(userLanguageId, "global.used-3", "TotalUsed3")  },
                        { "TotalUsed4",await _translationService.Translate(userLanguageId, "global.used-4", "TotalUsed4")  },
                        { "StockBalance",await _translationService.Translate(userLanguageId, "global.stock-balance", "StockBalance")  }
                    };

                    return ExportType(MVTEOAnnualExcel, request.ExportType, "MVTEO Annual Report On Collected Substances", userColumnNames);

                case "MVTEO Annual Report On Collected Substances 2":
                    var MVTEOAnnualResponse2 = await Mediator.Send(new GetServiceTechnicianReportQuery { Search = request.Search, IsFromExport = true });
                    var MVTEOAnnualExcel2 = MVTEOAnnualResponse2.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        ResponsiblePerson = u.ResponsiblePerson,
                        Year = u.Year,
                        SubmittedDate = u.SubmitedDate,
                        OrganizationName = u.OrganizationName,
                        UserName = u.UserName
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "ResponsiblePerson",await _translationService.Translate(userLanguageId, "reports:dlp-service-company-name", "ResponsiblePerson")  },
                        { "Year",await _translationService.Translate(userLanguageId, "global.year", "Year")  },
                        { "SubmittedDate",await _translationService.Translate(userLanguageId, "global.submitting-date", "SubmittedDate")  },
                        { "OrganizationName",await _translationService.Translate(userLanguageId, "mvtoCollectedSubstance.organization-name", "OrganizationName")  },
                        { "UserName",await _translationService.Translate(userLanguageId, "mvtoCollectedSubstance.user-name", "UserName")  }
                    };

                    return ExportType(MVTEOAnnualExcel2, request.ExportType, "MVTEO Annual Report On Collected Substances 2", userColumnNames);

                case "MVTEO Annual Report On Import/Export Of Ozone Depleting Substance":
                    var MVTEOAnnualReportResponse = await Mediator.Send(new GeImportExportSubstancesReportSummaryQuery { Search = request.Search, IsFromExport = true });
                    var MVTEOAnnualReportExcel = MVTEOAnnualReportResponse.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        NameOfSubstance = u.RefrigerantTypeName,
                        ChemicalFormula = u.RefrigerantTypeChemicalFormula,
                        Symbol = u.RefrigerantTypeASHRAEDesignation,
                        TariffNumber = u.TotalTariffNumber,
                        Import = u.TotalImport,
                        OwnConsumption = u.TotalOwnConsumption.HasValue ? Math.Round(u.TotalOwnConsumption.Value, 3) : (decimal?)null,
                        MarketSale = u.TotalSalesOnTheBiHMarket.HasValue ? Math.Round(u.TotalSalesOnTheBiHMarket.Value, 3) : (decimal?)null,
                        TotalImportedQuntity = u.TotalExportedQuantity.HasValue ? Math.Round(u.TotalExportedQuantity.Value, 3) : (decimal?)null,
                        StockBalance = u.TotalStockBalanceOnTheDay.HasValue ? Math.Round(u.TotalStockBalanceOnTheDay.Value, 3) : (decimal?)null,
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "reports.ordinalNumber", "No") },
                        { "NameOfSubstance",await _translationService.Translate(userLanguageId, "global.name-of-substance-mixture", "NameOfSubstance")  },
                        { "ChemicalFormula",await _translationService.Translate(userLanguageId, "global.chemical-formula", "ChemicalFormula")  },
                        { "Symbol",await _translationService.Translate(userLanguageId, "global.symbol", "Symbol")  },
                        { "TariffNumber",await _translationService.Translate(userLanguageId, "global.tariff-number", "TariffNumber")  },
                        { "Import",await _translationService.Translate(userLanguageId, "global.import", "Import")  },
                        { "OwnConsumption",await _translationService.Translate(userLanguageId, "global.own-consumption", "OwnConsumption")  },
                        { "MarketSale",await _translationService.Translate(userLanguageId, "global.market-sale", "MarketSale")  },
                        { "TotalImportedQuntity",await _translationService.Translate(userLanguageId, "global.total-imported-quantity", "TotalImportedQuntity")  },
                        { "StockBalance",await _translationService.Translate(userLanguageId, "global.stock-balance-on-31.12", "StockBalance")  }
                    };

                    return ExportType(MVTEOAnnualReportExcel, request.ExportType, "MVTEO Annual Report On Import/Export Of Ozone Depleting Substance", userColumnNames);

                case "MVTEO Annual Report On Import/Export Of Ozone Depleting Substance 2":
                    var MVTEOAnnualReportResponse2 = await Mediator.Send(new GetServiceTechnicianReportQuery { Search = request.Search, IsFromExport = true });
                    var MVTEOAnnualReportExcel2 = MVTEOAnnualReportResponse2.Items.Select(u => new
                    {
                        No = u.OrdinalNumber,
                        ResponsiblePerson = u.ResponsiblePerson,
                        Year = u.Year,
                        SubmittedDate = u.SubmitedDate,
                        OrganizationName = u.OrganizationName,
                        UserName = u.UserName
                    }).ToList();

                    userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "global.no", "No") },
                        { "ResponsiblePerson",await _translationService.Translate(userLanguageId, "reports:dlp-service-company-name", "ResponsiblePerson")  },
                        { "Year",await _translationService.Translate(userLanguageId, "global.year", "Year")  },
                        { "SubmittedDate",await _translationService.Translate(userLanguageId, "global.submitting-date", "SubmittedDate")  },
                        { "OrganizationName",await _translationService.Translate(userLanguageId, "mvtoCollectedSubstance.organization-name", "OrganizationName")  },
                        { "UserName",await _translationService.Translate(userLanguageId, "mvtoCollectedSubstance.user-name", "UserName")  }
                    };

                    return ExportType(MVTEOAnnualReportExcel2, request.ExportType, "MVTEO Annual Report On Import/Export Of Ozone Depleting Substance 2", userColumnNames);

                default:
                    throw new ArgumentException("Invalid CallFrom value.");
            }
        }
        catch (Exception ex)
        {

            return BadRequest(ex.Message);
        }
    }

    #region Utility

    private IActionResult ExportType<T>(IEnumerable<T> data, ExportTypeEnum exportType, string name, Dictionary<string, string> headerColumns)
    {
        switch (exportType)
        {
            case ExportTypeEnum.Excel:
                // Create Excel file
                var excelBytes = ExportToExcel(data, headerColumns);
                return Ok(File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", name + ".xlsx"));
            case ExportTypeEnum.CSV:
                // Export to CSV
                var csvFilePath = System.IO.Path.Combine(System.IO.Path.GetTempPath(), name + ".csv");
                ExportToCsv(data, csvFilePath);
                return new PhysicalFileResult(csvFilePath, "text/csv;charset=utf-8;");
            case ExportTypeEnum.PDF:
                // Export to PDF
                var pdfBytes = ExportToPdf(data, headerColumns);
                // Add logic to export data to PDF
                return Ok(File(pdfBytes, "application/pdf", name + ".pdf"));

            default:
                throw new InvalidOperationException("Invalid export type.");
        }
    }
    private byte[] ExportToExcel<T>(IEnumerable<T> data, Dictionary<string, string> headerColumns)
    {
        try
        {
            using (var workbook = new XLWorkbook())
            {
                IXLWorksheet worksheet = workbook.Worksheets.Add("Sheet1");

                // Add column headers
                var properties = typeof(T).GetProperties();

                for (int i = 0; i < properties.Length; i++)
                {
                    worksheet.Cell(1, i + 1).Value = Convert.ToString(properties[i].Name);
                }
                // Add column headers from the headerColumns dictionary
                int columnIndex = 1;
                foreach (var header in headerColumns)
                {
                    worksheet.Cell(1, columnIndex++).Value = header.Value; // Use the translated value
                }

                // Add data
                int row = 2;
                foreach (var item in data)
                {
                    for (int i = 0; i < properties.Length; i++)
                    {
                        var value = properties[i].GetValue(item);
                        worksheet.Cell(row, i + 1).Value = value != null ? value.ToString() : string.Empty;
                    }
                    row++;
                }

                // Save workbook to a MemoryStream
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return stream.ToArray();
                }


            }
        }
        catch (Exception ex)
        {
            // Log the exception for debugging
            Console.WriteLine($"Error exporting data to Excel: {ex.Message}");
            throw; // Re-throw the exception to propagate it further
        }
    }



    private void ExportToCsv<T>(IEnumerable<T> data, string filePath)
    {
        try
        {
            using (var streamWriter = new StreamWriter(filePath, false, new System.Text.UTF8Encoding(true)))
            {
                var properties = typeof(T).GetProperties();
                var columns = properties.Select(p => p.Name).ToArray();

                // Write CSV header
                streamWriter.WriteLine(string.Join(",", columns));

                // Write CSV data
                foreach (var item in data)
                {
                    var values = properties.Select(p =>
                    {
                        var value = p.GetValue(item)?.ToString();
                        if (value != null && value.Contains(","))
                        {
                            value = "\"" + value.Replace("\"", "\"\"") + "\"";
                        }
                        return value;
                    }).ToArray();

                    streamWriter.WriteLine(string.Join(",", values));
                }
            }
        }
        catch (Exception ex)
        {
            throw new Exception("Error exporting data to CSV", ex);
        }
    }


    public byte[] ExportToPdf<T>(IEnumerable<T> data, Dictionary<string, string> headerColumns)
    {
        try
        {
            using (MemoryStream ms = new MemoryStream())
            {
                Document document = new Document();
                PdfWriter.GetInstance(document, ms);
                document.Open();

                // Get the font path from wwwroot/fonts
                string fontPath = Path.Combine(_env.WebRootPath, "fonts", "dejavu-sans", "DejaVuSans.ttf");
                BaseFont baseFont = BaseFont.CreateFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                Font dataFont = new Font(baseFont, 8, Font.NORMAL, BaseColor.BLACK);
                Font headerFont = new Font(baseFont, 8, Font.BOLD, BaseColor.WHITE);

                // Create PDF table dynamically based on data properties
                PdfPTable table = new PdfPTable(data.First().GetType().GetProperties().Length);
                table.WidthPercentage = 110;

                // Set header background color
                var headerBackgroundColor = new BaseColor(0x29, 0x80, 0xBA); // #2980ba

                // Add table headers
                foreach (var prop in data.First().GetType().GetProperties())
                {
                    // Fetch the header title from the headerColumns dictionary
                    string headerTitle = headerColumns.ContainsKey(prop.Name)
                        ? headerColumns[prop.Name]
                        : prop.Name; // Use property name as a fallback

                    // Create a PdfPCell for the header
                    Phrase headerPhrase = new Phrase(headerTitle, headerFont);
                    PdfPCell headerCell = new PdfPCell(headerPhrase);

                    // Enable wrrapping for headers
                    headerCell.NoWrap = false;

                    // Set a fixed width constraint to force wrapping into smaller lines
                    float maxColumnWidth = 200f; // Max width for header (adjust as needed)
                    headerCell.MinimumHeight = 30f; // Ensure enough space for 3 lines
                    headerCell.FixedHeight = 40f; // Set approximate height for multi-line headers

                    // Set alignment and padding
                    headerCell.HorizontalAlignment = Element.ALIGN_CENTER;
                    headerCell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    headerCell.PaddingTop = 2f;
                    headerCell.PaddingBottom = 2f;
                    headerCell.PaddingLeft = 2f;
                    headerCell.PaddingRight = 2f;

                    // Set background color
                    headerCell.BackgroundColor = headerBackgroundColor;

                    // Add the header cell to the table
                    table.AddCell(headerCell);
                }

                // Define alternating row colors
                var evenRowBackgroundColor = new BaseColor(0xF5, 0xF5, 0xF5);

                // Add table data
                int rowIndex = 0;
                foreach (var item in data)
                {
                    foreach (var prop in item.GetType().GetProperties())
                    {
                        object value = prop.GetValue(item);
                        string displayValue;

                        // Check if the property is a DateTime type
                        if (prop.PropertyType == typeof(DateTime) || prop.PropertyType == typeof(DateTime?))
                        {
                            DateTime? dateValue = value as DateTime?;
                            displayValue = dateValue?.ToString("yyyy-MM-dd") ?? ""; // Customize the format as needed
                        }
                        else
                        {
                            displayValue = value?.ToString() ?? "";
                        }

                        PdfPCell cell = new PdfPCell(new Phrase(displayValue, dataFont));
                        cell.Border = Rectangle.NO_BORDER;

                        // Apply alternating row colors
                        if (rowIndex % 2 == 0)
                        {
                            cell.BackgroundColor = evenRowBackgroundColor;
                        }
                        cell.HorizontalAlignment = Element.ALIGN_LEFT;
                        table.AddCell(cell);
                    }
                    rowIndex++;
                }

                document.Add(table);
                document.Close();

                return ms.ToArray();
            }
        }
        catch (Exception ex)
        {
            throw new Exception("Error exporting data to PDF", ex);
        }
    }



    //public byte[] ExportToPdf<T>(IEnumerable<T> data)
    //{
    //    try
    //    {
    //        using (MemoryStream ms = new MemoryStream())
    //        {
    //            Document document = new Document();
    //            PdfWriter.GetInstance(document, ms);
    //            document.Open();

    //            // Get the font path from wwwroot/fonts
    //            string fontPath = Path.Combine(_env.WebRootPath, "fonts", "dejavu-sans", "DejaVuSans.ttf");
    //            BaseFont baseFont = BaseFont.CreateFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
    //            Font dataFont = new Font(baseFont, 8, Font.NORMAL, BaseColor.BLACK);
    //            Font headerFont = new Font(baseFont, 8, Font.BOLD, BaseColor.WHITE);

    //            // Create PDF table dynamically based on data properties
    //            PdfPTable table = new PdfPTable(data.First().GetType().GetProperties().Length);
    //            table.WidthPercentage = 100;
    //            table.DefaultCell.Border = Rectangle.NO_BORDER; // Set border to none

    //            // Calculate column widths
    //            float[] columnWidths = new float[data.First().GetType().GetProperties().Length];
    //            for (int i = 0; i < data.First().GetType().GetProperties().Length; i++)
    //            {
    //                float maxWidth = 0f;
    //                foreach (var item in data)
    //                {
    //                    var value = item.GetType().GetProperties()[i].GetValue(item)?.ToString() ?? "";
    //                    float width = value.Length * 10f; // Adjust the multiplier to scale the width
    //                    maxWidth = Math.Max(maxWidth, width);
    //                }
    //                columnWidths[i] = Math.Min(maxWidth, 130f);
    //            }
    //            table.SetWidths(columnWidths);

    //            // Set header background color
    //            var headerBackgroundColor = new BaseColor(0x29, 0x80, 0xBA); // #2980ba

    //            // Add table headers
    //            foreach (var prop in data.First().GetType().GetProperties())
    //            {
    //                PdfPCell headerCell = new PdfPCell(new Phrase(prop.Name, headerFont));
    //                headerCell.BackgroundColor = headerBackgroundColor;
    //                headerCell.HorizontalAlignment = Element.ALIGN_LEFT;
    //                headerCell.Border = Rectangle.NO_BORDER;
    //                headerCell.PaddingTop = 10f;
    //                headerCell.PaddingBottom = 10f;
    //                headerCell.VerticalAlignment = Element.ALIGN_MIDDLE;
    //               // headerCell.NoWrap = false; // This enables wrapping
    //                //headerCell.FixedHeight = 25f; // Set a fixed height for headers (adjust as necessary)
    //                table.AddCell(headerCell);
    //            }

    //            // Define alternating row colors
    //            var evenRowBackgroundColor = new BaseColor(0xF5, 0xF5, 0xF5);

    //            // Add table data
    //            int rowIndex = 0;
    //            foreach (var item in data)
    //            {
    //                foreach (var prop in item.GetType().GetProperties())
    //                {

    //                    object value = prop.GetValue(item);
    //                    string displayValue;

    //                    // Check if the property is a DateTime type
    //                    if (prop.PropertyType == typeof(DateTime) || prop.PropertyType == typeof(DateTime?))
    //                    {
    //                        // Convert to DateTime and format as date if not null
    //                        DateTime? dateValue = value as DateTime?;
    //                        displayValue = dateValue?.ToString("yyyy-MM-dd") ?? ""; // Customize the format as needed
    //                    }
    //                    else
    //                    {
    //                        // Use default string representation for other types
    //                        displayValue = value?.ToString() ?? "";
    //                    }

    //                    //PdfPCell cell = new PdfPCell(new Phrase(prop.GetValue(item)?.ToString() ?? "", dataFont));
    //                    //cell.Border = Rectangle.NO_BORDER;
    //                    PdfPCell cell = new PdfPCell(new Phrase(displayValue, dataFont));
    //                    cell.Border = Rectangle.NO_BORDER;

    //                    if (rowIndex % 2 == 0)
    //                    {
    //                        cell.BackgroundColor = evenRowBackgroundColor;
    //                    }
    //                    cell.HorizontalAlignment = Element.ALIGN_LEFT;
    //                    table.AddCell(cell);
    //                }
    //                rowIndex++;
    //            }

    //            document.Add(table);
    //            document.Close();

    //            return ms.ToArray();
    //        }
    //    }
    //    catch (Exception ex)
    //    {
    //        throw new Exception("Error exporting data to PDF", ex);
    //    }
    //}

    // ---------------------

    //private byte[] ExportToPdf<T>(IEnumerable<T> data)
    //{
    //    try
    //    {
    //        using (MemoryStream ms = new MemoryStream())
    //        {
    //            Document document = new Document();
    //            PdfWriter.GetInstance(document, ms);
    //            document.Open();

    //            // Create PDF table dynamically based on data properties
    //            PdfPTable table = new PdfPTable(data.First().GetType().GetProperties().Length);
    //            table.WidthPercentage = 100;
    //            table.DefaultCell.Border = Rectangle.NO_BORDER; // Set border to none

    //            // Calculate column widths based on the maximum content width in each column of the first row
    //            float[] columnWidths = new float[data.First().GetType().GetProperties().Length];
    //            for (int i = 0; i < data.First().GetType().GetProperties().Length; i++)
    //            {
    //                float maxWidth = 0f;

    //                foreach (var item in data)
    //                {
    //                    var value = item.GetType().GetProperties()[i].GetValue(item)?.ToString() ?? "";
    //                    float width = value.Length * 10f; // Adjust the multiplier to scale the width
    //                    maxWidth = Math.Max(maxWidth, width);
    //                }

    //                // Limit the maximum width to ensure readability
    //                columnWidths[i] = Math.Min(maxWidth, 180f); // Adjust the maximum width as needed
    //            }
    //            table.SetWidths(columnWidths);

    //            // Set header background color and font color
    //            var headerBackgroundColor = new BaseColor(0x29, 0x80, 0xBA); // #107eb7
    //            var headerFontColor = BaseColor.WHITE;

    //            // Set header font
    //            var headerFont = FontFactory.GetFont("Inter", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, 10, Font.BOLD, headerFontColor);

    //            // Add table headers
    //            foreach (var prop in data.First().GetType().GetProperties())
    //            {
    //                PdfPCell headerCell = new PdfPCell(new Phrase(prop.Name, headerFont));
    //                headerCell.BackgroundColor = headerBackgroundColor;
    //                headerCell.HorizontalAlignment = Element.ALIGN_LEFT;
    //                headerCell.Border = Rectangle.NO_BORDER; // Set border to none

    //                // Set padding for top and bottom
    //                headerCell.PaddingTop = 10f;   // Adjust the top padding as needed
    //                headerCell.PaddingBottom = 10f; // Adjust the bottom padding as needed

    //                // Set vertical alignment to middle
    //                headerCell.VerticalAlignment = Element.ALIGN_MIDDLE;

    //                table.AddCell(headerCell);
    //            }

    //            // Set data font color and font
    //            var dataFontColor = BaseColor.BLACK; // Adjust if needed
    //            var dataFont = FontFactory.GetFont("Inter", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, 10); // Use 'Inter', sans-serif font

    //            // Define alternating row colors
    //            var evenRowBackgroundColor = new BaseColor(0xF5, 0xF5, 0xF5); // Light sky blue (#E0F7FA)

    //            // Add table data
    //            int rowIndex = 0;

    //            // Add table data
    //            foreach (var item in data)
    //            {
    //                foreach (var prop in item.GetType().GetProperties())
    //                {
    //                    PdfPCell cell = new PdfPCell(new Phrase(prop.GetValue(item)?.ToString() ?? "", dataFont));
    //                    cell.Border = Rectangle.NO_BORDER; // Set border to none
    //                    // Apply background color to even rows
    //                    if (rowIndex % 2 == 0)
    //                    {
    //                        cell.BackgroundColor = evenRowBackgroundColor;
    //                    }

    //                    // Left-align text in each cell
    //                    cell.HorizontalAlignment = Element.ALIGN_LEFT;
    //                    table.AddCell(cell);
    //                }
    //                rowIndex++;
    //            }

    //            document.Add(table);
    //            document.Close();

    //            return ms.ToArray();
    //        }
    //    }
    //    catch (Exception ex)
    //    {
    //        throw new Exception("Error exporting data to PDF", ex);
    //    }
    //}

    public static string ConvertUtcToLocalAndFormat(DateTime utcDateTime, string timeZoneId, string dateFormat)
    {
        // Get the timezone info
        TimeZoneInfo timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);

        // Convert UTC time to local time
        DateTime localDateTime = TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, timeZoneInfo);

        // Format the local time with the specified format
        string formattedLocalTime = localDateTime.ToString(dateFormat, CultureInfo.InvariantCulture);

        return formattedLocalTime;
    }

    #endregion
}
