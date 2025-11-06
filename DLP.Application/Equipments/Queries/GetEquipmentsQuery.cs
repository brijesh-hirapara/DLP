using System;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Application.Equipments.DTOs;
using DLP.Domain.Entities;
using MediatR;
using System.Linq.Expressions;
using DLP.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Mappings;
using DLP.Application.CompanyBranches.Queries;
using Microsoft.AspNetCore.Mvc;
using System.Xml.Linq;
using DLP.Application.ActivityLogs.Dto;
using DLP.Domain.Enums;
using DLP.Application.Requests.DTOs;

namespace DLP.Application.Equipments.Queries
{
    public class GetEquipmentsQuery : IOrderingQuery<Equipment>, IRequest<OrdinalPaginatedList<EquipmentDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string Search { get; set; }
        public bool IsArchived { get; set; }
        public bool IsFromExport { get; set; } = false;


        private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

        private static readonly IReadOnlyDictionary<string, Expression<Func<Equipment, object?>>> OrderingPropertyMappings =
            new Dictionary<string, Expression<Func<Equipment, object?>>>(StringComparer)
            {
            { "branchOfficeName", x => x.CompanyBranch != null ? x.CompanyBranch.BranchOfficeName : "" },
            { "typeOfEquipment", x => x.TypeOfEquipment != null ? x.TypeOfEquipment.Name : "" },
            { "manufacturer", x => x.Manufacturer },
            { "serialNumber", x => x.SerialNumber },
            { "type", x => x.Type },
            { "dataOfPurchase", x => x.DateOfPurchase },
            { "model", x => x.Model },
            { "yearOfProduction", x => x.YearOfProduction },
            { "refrigerantType", x => x.RefrigerantType != null ? x.RefrigerantType.Name : "" }
            };

        private static readonly OrderByFunction<Equipment> DefaultOrdering = new(x => x.DateOfPurchase, true);

        private static IReadOnlySet<string>? PropertyKeys { get; set; }

        //Sorting

        public SortingBy? Sorting { get; set; }
        public OrderByFunction<Equipment> GetDefaultOrdering() => DefaultOrdering;
        public IReadOnlyDictionary<string, Expression<Func<Equipment, object?>>> GetOrderingPropertyMappings() => OrderingPropertyMappings;
        public IReadOnlySet<string> GetPropertyKeys()
        {
            PropertyKeys ??= OrderingPropertyMappings.Keys.ToHashSet(StringComparer);
            return PropertyKeys;
        }
    }

    public class GetEquipmentsQueryHandler : IRequestHandler<GetEquipmentsQuery, OrdinalPaginatedList<EquipmentDto>>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUserService;
        private readonly IIdentityService _identityService;

        public GetEquipmentsQueryHandler(IAppDbContext context, IActivityLogger activityLogger, ICurrentUserService currentUserService, IIdentityService identityService)
        {
            _context = context;
            _activityLogger = activityLogger;
            _currentUserService = currentUserService;
            _identityService = identityService;
        }

        public async Task<OrdinalPaginatedList<EquipmentDto>> Handle(GetEquipmentsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var interceptor = await (new GetEquipmentsQueryInterceptor(_identityService, _currentUserService)).Get();
                var equipments = _context.Equipments
                    .Include(x => x.CompanyBranch)
                    .Include(x => x.TypeOfEquipment)
                    .Include(x => x.TypeOfCoolingSystem)
                    .Include(x => x.RefrigerantType)
                    .Include(x => x.PurposeOfEquipment)
                    .Where(interceptor)
                    .Where(e => !e.IsDeleted && e.IsArchived == request.IsArchived)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(request.Search))
                {
                    string search = request.Search.ToLower();

                    equipments = equipments.Where(e =>
                        (e.CompanyBranch != null && e.CompanyBranch.BranchOfficeName.ToLower().Contains(search)) ||
                        (e.TypeOfEquipment != null && e.TypeOfEquipment.Name.ToLower().Contains(search)) ||
                        (e.TypeOfCoolingSystem != null && e.TypeOfCoolingSystem.Name.ToLower().Contains(search)) ||
                        (e.RefrigerantType != null && e.RefrigerantType.Name.ToLower().Contains(search)) ||
                        e.Manufacturer.ToLower().Contains(search) ||
                        e.Model.ToLower().Contains(search) ||
                        e.SerialNumber.ToLower().Contains(search) ||
                        e.YearOfProduction.ToString().Contains(search) ||
                        (e.Comments != null && e.Comments.ToLower().Contains(search))
                    );
                }

                OrdinalPaginatedList<EquipmentDto> responseData;

                if (request.IsFromExport)
                {
                    var response =  equipments
                        .ApplyOrderByFunctions(request.GetOrderByFunction())
                        .Select(e => new EquipmentDto
                        {
                            Id = e.Id,
                            CompanyBranchId = e.CompanyBranchId,
                            BranchOfficeName = e.CompanyBranch != null ? e.CompanyBranch.BranchOfficeName : "",
                            TypeOfEquipmentId = e.TypeOfEquipmentId,
                            TypeOfEquipment = e.TypeOfEquipment != null ? e.TypeOfEquipment.Name : "",
                            TypeOfEquipmentOther = e.TypeOfEquipmentOther,
                            TypeOfCoolingSystemId = e.TypeOfCoolingSystemId,
                            TypeOfCoolingSystem = e.TypeOfCoolingSystem != null ? e.TypeOfCoolingSystem.Name : "",
                            TypeOfCoolingSystemOther = e.TypeOfCoolingSystemOther,
                            Manufacturer = e.Manufacturer,
                            Type = e.Type,
                            Model = e.Model,
                            SerialNumber = e.SerialNumber,
                            YearOfProduction = e.YearOfProduction,
                            DateOfPurchase = e.DateOfPurchase,
                            RefrigerantTypeId = e.RefrigerantTypeId,
                            RefrigerantType = e.RefrigerantType != null ? e.RefrigerantType.Name : "",
                            MassOfRefrigerantKg = e.MassOfRefrigerantKg,
                            PurposeOfEquipmentId = e.PurposeOfEquipmentId,
                            PurposeOfEquipment = e.PurposeOfEquipment.Name,
                            CoolingTemperature = e.CoolingTemperature,
                            CoolingEffectKw = e.CoolingEffectKw,
                            CompressorConnectionPowerKw = e.CompressorConnectionPowerKw,
                            LiquidCollectorVolume = e.LiquidCollectorVolume,
                            MassAddedLastYearInKg = e.MassAddedLastYearInKg,
                            CommissioningDate = e.CommissioningDate,
                            Comments = e.Comments,
                            CreatedAt = e.CreatedAt
                        })
                        .ToList();
                    responseData = new OrdinalPaginatedList<EquipmentDto>(response, response.Count, request.PageNumber, request.PageSize);

                }
                else
                {
                    responseData = await equipments
                    .ApplyOrderByFunctions(request.GetOrderByFunction())
                    .Select(e => new EquipmentDto
                    {
                        Id = e.Id,
                        CompanyBranchId = e.CompanyBranchId,
                        BranchOfficeName = e.CompanyBranch != null ? e.CompanyBranch.BranchOfficeName : "",
                        TypeOfEquipmentId = e.TypeOfEquipmentId,
                        TypeOfEquipment = e.TypeOfEquipment != null ? e.TypeOfEquipment.Name : "",
                        TypeOfEquipmentOther = e.TypeOfEquipmentOther,
                        TypeOfCoolingSystemId = e.TypeOfCoolingSystemId,
                        TypeOfCoolingSystem = e.TypeOfCoolingSystem != null ? e.TypeOfCoolingSystem.Name : "",
                        TypeOfCoolingSystemOther = e.TypeOfCoolingSystemOther,
                        Manufacturer = e.Manufacturer,
                        Type = e.Type,
                        Model = e.Model,
                        SerialNumber = e.SerialNumber,
                        YearOfProduction = e.YearOfProduction,
                        DateOfPurchase = e.DateOfPurchase,
                        RefrigerantTypeId = e.RefrigerantTypeId,
                        RefrigerantType = e.RefrigerantType != null ? e.RefrigerantType.Name : "",
                        MassOfRefrigerantKg = e.MassOfRefrigerantKg,
                        PurposeOfEquipmentId = e.PurposeOfEquipmentId,
                        PurposeOfEquipment = e.PurposeOfEquipment.Name,
                        CoolingTemperature = e.CoolingTemperature,
                        CoolingEffectKw = e.CoolingEffectKw,
                        CompressorConnectionPowerKw = e.CompressorConnectionPowerKw,
                        LiquidCollectorVolume = e.LiquidCollectorVolume,
                        MassAddedLastYearInKg = e.MassAddedLastYearInKg,
                        CommissioningDate = e.CommissioningDate,
                        Comments = e.Comments,
                        CreatedAt = e.CreatedAt
                    })
                    .OrderBy(x => x.CreatedAt)
                    .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
                }

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Retrieved equipment list successfully."
                });

                return responseData;
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Failed to retrieve equipment list", _currentUserService.UserId);
                throw;
            }
        }
    }


}

