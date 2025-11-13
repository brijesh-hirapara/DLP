using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.DTOs;
using DLP.Application.Common.Interfaces;
using DLP.Application.Shipments.DTOs;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Shipments.Queries
{
    public class GetShipmentDetailsQuery : IRequest<ShipmentsDto>
    {
        public Guid Id { get; set; }
    }

    public class GetShipmentDetailsQueryHandler : IRequestHandler<GetShipmentDetailsQuery, ShipmentsDto>
    {
        private readonly IAppDbContext _context;
        private readonly ITranslationService _translationService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IActivityLogger _activityLogger;
        private readonly IBlobService _blobService;

        public GetShipmentDetailsQueryHandler(
            IAppDbContext context,
            ITranslationService translationService,
            ICurrentUserService currentUserService,
            IActivityLogger activityLogger,
            IBlobServiceFactory blobServiceFactory)
        {
            _context = context;
            _translationService = translationService;
            _currentUserService = currentUserService;
            _activityLogger = activityLogger;
            _blobService = blobServiceFactory.Create(FolderNames.Requests);
        }

        public async Task<ShipmentsDto> Handle(GetShipmentDetailsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var shipmentsDetails = await _context.Shipments
                          .Include(x => x.UploadPODFiles)
                          .Include(x => x.TransportRequest)
                              .ThenInclude(p => p.TransportPickup)
                                  .ThenInclude(t => t.Country)
                          .Include(x => x.TransportRequest)
                              .ThenInclude(p => p.TransportDelivery)
                                  .ThenInclude(t => t.Country)
                          .Include(x => x.TransportRequest)
                              .ThenInclude(p => p.TransportCarrier.Where(y => y.IsShipperBook && !y.IsDeleted && y.Status == TransportCarrierStatus.Accepted))
                          .Include(x => x.ShipperOrganization)
                          .Include(x => x.CarrierOrganization)
                          .Include(x => x.TransportRequest)
                                .ThenInclude(p => p.TransportGoods)
                          .Include(x => x.TransportRequest)
                                .ThenInclude(p => p.TransportInformation)
                                    .ThenInclude(t => t.Currency)
                               .FirstOrDefaultAsync(r => r.Id == query.Id && r.IsActive && !r.IsDeleted)

                ?? throw new ArgumentException($"Transport Request {query.Id} not found");

                var requestDetails = shipmentsDetails.Adapt<ShipmentsDto>();

                var shipmentAssignTrucksDetail = await _context.ShipmentAssignTrucks.FirstOrDefaultAsync(r => r.ShipmentId == query.Id && r.IsActive && !r.IsDeleted);

                 requestDetails.ShipmentAssignTrucks = shipmentAssignTrucksDetail.Adapt<ShipmentAssignTruckDto>();

                //requestDetails.UploadPODFiles = shipmentsDetails.UploadPODFiles?.Select(f => new FileResultDto
                //{
                //    Id = f.Id,
                //    ContentType = f.ContentType,
                //    FileContents = File.ReadAllBytes(f.FilePath),
                //    FileName = f.FileName
                //}).ToList();

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Successfully retrieved Transport Request details!"
                });

                return requestDetails;
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, $"Failed to retrieve Request details with id {query.Id}", _currentUserService.UserId);

                throw;
            }
        }
    }
}