using System;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.DTOs;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Equipments.DTOs;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Equipments.Queries
{
    public class GetSingleEquipmentQuery : IRequest<EquipmentDto>
    {
        public Guid Id { get; set; }
    }

    public class GetSingleEquipmentQueryHandler : IRequestHandler<GetSingleEquipmentQuery, EquipmentDto>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly IBlobService _blobService; // Blob service for file operations

        public GetSingleEquipmentQueryHandler(IAppDbContext context, ICurrentUserService currentUserService, IActivityLogger logger, IBlobServiceFactory blobServiceFactory)
        {
            _context = context;
            _currentUserService = currentUserService;
            _logger = logger;
            _blobService = blobServiceFactory.Create(FolderNames.Equipments);
        }


        public async Task<EquipmentDto> Handle(GetSingleEquipmentQuery request, CancellationToken cancellationToken)
        {
            var equipment = await _context.Equipments
                                         .Include(e => e.CompanyBranch)
                                         .ThenInclude(e=>e.Organization)
                                         .Include(x => x.CreatedBy)
                                         .Include(e => e.TypeOfEquipment)
                                         .Include(e => e.TypeOfCoolingSystem)
                                         .Include(e => e.RefrigerantType)
                                         .Include(x => x.PurposeOfEquipment)
                                         .Include(x => x.EquipmentFiles.Where(f => !f.IsDeleted))
                                         .Where(e => e.Id == request.Id && !e.IsDeleted)
                                         .FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (equipment == null)
            {
                await _logger.Error("Equipment couldn't be found!", _currentUserService.UserId);
                throw new NotFoundException("Equipment couldn't be found!");
            }

            var response = new EquipmentDto
            {
                Id = equipment.Id,
                CompanyBranchId = equipment.CompanyBranchId,
                BranchOfficeName = equipment.CompanyBranch?.BranchOfficeName,
                TypeOfEquipmentId = equipment.TypeOfEquipmentId,
                TypeOfEquipment = equipment.TypeOfEquipment?.IsDeleted == true ? equipment.TypeOfEquipment?.Name : "",
                TypeOfEquipmentOther = !string.IsNullOrEmpty(equipment.TypeOfEquipmentOther) ? equipment.TypeOfEquipmentOther : string.Empty,
                TypeOfCoolingSystemId = equipment.TypeOfCoolingSystemId,
                TypeOfCoolingSystem = equipment.TypeOfCoolingSystem?.Name,
                TypeOfCoolingSystemOther = !string.IsNullOrEmpty(equipment.TypeOfCoolingSystemOther) ? equipment.TypeOfCoolingSystemOther : string.Empty,
                RefrigerantTypeId = equipment.RefrigerantTypeId,
                RefrigerantType = equipment.RefrigerantType?.IsDeleted == true ? equipment.RefrigerantType?.Name :  "",
                Manufacturer = !string.IsNullOrEmpty(equipment.Manufacturer) ? equipment.Manufacturer : string.Empty,
                Type = !string.IsNullOrEmpty(equipment.Type) ? equipment.Type : string.Empty,
                Model = !string.IsNullOrEmpty(equipment.Model) ? equipment.Model : string.Empty,
                SerialNumber = !string.IsNullOrEmpty(equipment.SerialNumber) ? equipment.SerialNumber : string.Empty,
                YearOfProduction = equipment.YearOfProduction,
                DateOfPurchase = equipment.DateOfPurchase,
                MassOfRefrigerantKg = equipment.MassOfRefrigerantKg,
                PurposeOfEquipmentId = equipment.PurposeOfEquipmentId,
                PurposeOfEquipment = equipment.PurposeOfEquipment?.Name,
                CoolingTemperature = equipment.CoolingTemperature,
                CoolingEffectKw = equipment.CoolingEffectKw,
                CompressorConnectionPowerKw = equipment.CompressorConnectionPowerKw,
                LiquidCollectorVolume = equipment.LiquidCollectorVolume,
                MassAddedLastYearInKg = equipment.MassAddedLastYearInKg,
                CommissioningDate = equipment.CommissioningDate,
                Comments = !string.IsNullOrEmpty(equipment.Comments) ? equipment.Comments : string.Empty,
                CreatedAt = equipment.CreatedAt,
                IsArchived = equipment.IsArchived,
                CompanyName = equipment.CompanyBranch.Organization?.Name,
                TaxNumber = equipment.CompanyBranch.Organization?.TaxNumber

            };

            try
            {
                var pendingSyncFiles = equipment.EquipmentFiles
                    .Where(f => string.IsNullOrEmpty(f.FilePath))
                    .ToList();

                foreach (var file in pendingSyncFiles)
                {
                    var fileSync = await _context.FileSynchronizations
                        .Where(x => x.Id == file.Id)
                        .SingleOrDefaultAsync(cancellationToken);

                    if (fileSync != null)
                    {
                        var fileStream = new MemoryStream(fileSync.Data);
                        var filePath = await _blobService.SaveFileAsync(fileStream, fileSync.FileName);
                        file.FilePath = filePath; 
                        _context.EquipmentFiles.Update(file);
                        _context.FileSynchronizations.Remove(fileSync); 
                    }
                }

                await _context.SaveChangesAsync(cancellationToken); 

                
                response.Files = equipment.EquipmentFiles
                    .Where(f => !f.IsDeleted && File.Exists(f.FilePath))
                    .Select(f => new FileResultDto
                    {
                        ContentType = f.ContentType,
                        FileContents = File.ReadAllBytes(f.FilePath),
                        FileName = f.FileName
                    }).ToList();

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Equipment with ID {request.Id} found successfully!"
                });
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to synchronize equipment files!", _currentUserService.UserId);
                response.Files = new List<FileResultDto>(); // Assign an empty list in case of an exception
            }

            return response;
        }


        //public async Task<EquipmentDto> Handle(GetSingleEquipmentQuery request, CancellationToken cancellationToken)
        //{
        //    var equipment = await _context.Equipments
        //                                 .Include(e => e.CompanyBranch)
        //                                 .Include(x => x.CreatedBy)
        //                                 .Include(e => e.TypeOfEquipment)
        //                                 .Include(e => e.TypeOfCoolingSystem)
        //                                 .Include(e => e.RefrigerantType)
        //                                 .Include(x => x.PurposeOfEquipment)
        //                                 .Include(x => x.EquipmentFiles.Where(x => !x.IsDeleted))
        //                                 .Where(e => e.Id == request.Id && !e.IsDeleted)
        //                                 .FirstOrDefaultAsync(cancellationToken: cancellationToken);

        //    if (equipment == null)
        //    {
        //        await _logger.Error("Equipment couldn't be found!", _currentUserService.UserId);
        //        throw new NotFoundException("Equipment couldn't be found!");
        //    }
        //    var response = new EquipmentDto
        //    {
        //        Id = equipment.Id,
        //        CompanyBranchId = equipment.CompanyBranchId,
        //        BranchOfficeName = equipment.CompanyBranch?.BranchOfficeName,
        //        TypeOfEquipmentId = equipment.TypeOfEquipmentId,
        //        TypeOfEquipment = equipment.TypeOfEquipment?.Name,
        //        TypeOfEquipmentOther = !string.IsNullOrEmpty(equipment.TypeOfEquipmentOther) ? equipment.TypeOfEquipmentOther : string.Empty,
        //        TypeOfCoolingSystemId = equipment.TypeOfCoolingSystemId,
        //        TypeOfCoolingSystem = equipment.TypeOfCoolingSystem?.Name,
        //        TypeOfCoolingSystemOther = !string.IsNullOrEmpty(equipment.TypeOfCoolingSystemOther) ? equipment.TypeOfCoolingSystemOther : string.Empty,
        //        RefrigerantTypeId = equipment.RefrigerantTypeId,
        //        RefrigerantType = equipment.RefrigerantType?.Name,
        //        Manufacturer = !string.IsNullOrEmpty(equipment.Manufacturer) ? equipment.Manufacturer : string.Empty,
        //        Type = !string.IsNullOrEmpty(equipment.Type) ? equipment.Type : string.Empty,
        //        Model = !string.IsNullOrEmpty(equipment.Model) ? equipment.Model : string.Empty,
        //        SerialNumber = !string.IsNullOrEmpty(equipment.SerialNumber) ? equipment.SerialNumber : string.Empty,
        //        YearOfProduction = equipment.YearOfProduction,
        //        DateOfPurchase = equipment.DateOfPurchase,
        //        MassOfRefrigerantKg = equipment.MassOfRefrigerantKg,
        //        PurposeOfEquipmentId = equipment.PurposeOfEquipmentId,
        //        PurposeOfEquipment = equipment.PurposeOfEquipment?.Name,
        //        CoolingTemperature = equipment.CoolingTemperature,
        //        CoolingEffectKw = equipment.CoolingEffectKw,
        //        CompressorConnectionPowerKw = equipment.CompressorConnectionPowerKw,
        //        LiquidCollectorVolume = equipment.LiquidCollectorVolume,
        //        MassAddedLastYearInKg = equipment.MassAddedLastYearInKg,
        //        CommissioningDate = equipment.CommissioningDate,
        //        Comments = !string.IsNullOrEmpty(equipment.Comments) ? equipment.Comments : string.Empty,
        //        CreatedAt = equipment.CreatedAt,
        //        IsArchived = equipment.IsArchived,
        //    };

        //    try
        //    {
        //        response.Files = equipment.EquipmentFiles?.Select(f => new FileResultDto
        //        {
        //            ContentType = f.ContentType,
        //            FileContents = File.ReadAllBytes(f.FilePath),
        //            FileName = f.FileName
        //        }).ToList();

        //        await _logger.Add(new ActivityLogDto
        //        {
        //            UserId = _currentUserService.UserId,
        //            LogTypeId = (int)LogTypeEnum.INFO,
        //            Activity = $"Equipment found successfully!"
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        await _logger.Exception(ex.Message, "Failed to get equipment files!", _currentUserService.UserId);
        //        response.Files = new List<FileResultDto>();
        //    }

        //    return response;
        ////}
    }
}

