using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.TransportManagemen.DTOs;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.TransportManagemen.Queries
{
    public class GetTransportRequestDetailsQuery : IRequest<TransportRequestDto>
    {
        public Guid Id { get; set; }
    }

    public class GetTransportRequestDetailsQueryHandler : IRequestHandler<GetTransportRequestDetailsQuery, TransportRequestDto>
    {
        private readonly IAppDbContext _context;
        private readonly ITranslationService _translationService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IActivityLogger _activityLogger;
        private readonly IBlobService _blobService;

        public GetTransportRequestDetailsQueryHandler(
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

        public async Task<TransportRequestDto> Handle(GetTransportRequestDetailsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var transportRequests = await _context.TransportRequests
                               .Include(x => x.TransportPickup)
                                    .ThenInclude(p => p.Country)
                               .Include(x => x.TransportDelivery)
                                    .ThenInclude(p => p.Country)
                               .Include(x => x.TransportGoods)
                                    .ThenInclude(p => p.TypeOfGoods)
                               .Include(x => x.TransportInformation)
                                    .ThenInclude(p => p.Currency)
                               .Include(x => x.TransportCarrier.Where(c => !c.IsDeleted && c.OrganizationId == _currentUserService.OrganizationId))
                                    .ThenInclude(p=>p.TruckType)
                                    
                               .FirstOrDefaultAsync(r =>  r.Id == query.Id)

                ?? throw new ArgumentException($"Transport Request {query.Id} not found");

                var requestDetails = transportRequests.Adapt<TransportRequestDto>();

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