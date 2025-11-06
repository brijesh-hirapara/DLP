using DLP.Application.Common.Interfaces;
using DLP.Application.Requests.DTOs;
using DLP.Application.VehicleFleetRequests.DTOs;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace DLP.Application.VehicleFleetRequests.Queries
{
    public class GetVehicleFleetLatestRequestQuery : IRequest<VehicleFleetRequestDetailDto>
    {
       
    }

    public class GetVehicleFleetLatestRequestQueryHandler
        : IRequestHandler<GetVehicleFleetLatestRequestQuery, VehicleFleetRequestDetailDto>
    {
        private readonly IAppDbContext _dbContext;
        private readonly ILogger<GetVehicleFleetLatestRequestQueryHandler> _logger;
        private readonly ICurrentUserService _currentUserService;

        public GetVehicleFleetLatestRequestQueryHandler(IAppDbContext dbContext, ILogger<GetVehicleFleetLatestRequestQueryHandler> logger, ICurrentUserService currentUserService)
        {
            _dbContext = dbContext;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task<VehicleFleetRequestDetailDto> Handle(GetVehicleFleetLatestRequestQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Fetch main request
                VehicleFleetRequestDetailDto vehicleFleetRequestDetailDto = new VehicleFleetRequestDetailDto();

                var vehicleFleetLatestRequests = await _dbContext.VehicleFleetRequests
                                                .AsNoTracking()
                                                .Where(r => r.CreatedById == _currentUserService.UserId
                                                         && r.Status == (int)VehicleFleetRequestStatus.Confirmed
                                                         && !r.IsDeleted)
                                                .OrderByDescending(r => r.CreatedAt)
                                                .FirstOrDefaultAsync(cancellationToken);

                if (vehicleFleetLatestRequests == null)
                {
                    return vehicleFleetRequestDetailDto;
                }
                    //throw new ApplicationException($"Vehicle Fleet Request not found with Id: {_currentUserService.UserId}");

                // Fetch related questionnaires                
                var questionnaireList = await _dbContext.Questionnaire
                    .AsNoTracking()
                    .Where(q => q.RequestId == vehicleFleetLatestRequests.Id.ToString() && q.ModuleName == "VehicleFleetRequest")
                    .Select(q => new QuestionnaireDto
                    {
                        Id = q.Id,
                        RequestId = q.RequestId,
                        QuestionNo = q.QuestionNo,
                        Values = q.Values,
                        CodebookId = q.CodebookId,
                        CodebookName = q.CodebookId.HasValue
                            ? _dbContext.Codebooks
                                .Where(c => c.Id == q.CodebookId)
                                .Select(c => c.Name)
                                .FirstOrDefault()
                            : null,
                        CountryId = q.CountryId,
                        CountryName = q.CountryId.HasValue
                            ? _dbContext.Codebooks
                                .Where(c => c.Id == q.CountryId)
                                .Select(c => c.Name)
                                .FirstOrDefault()
                            : null,
                        TrailerQTY = q.TrailerQTY
                    })
                    .ToListAsync(cancellationToken);

                // Build DTO
                var dto = new VehicleFleetRequestDetailDto
                {
                    Id = vehicleFleetLatestRequests.Id,
                    Status = ((VehicleFleetRequestStatus)vehicleFleetLatestRequests.Status),
                    Comments = vehicleFleetLatestRequests.Comments,
                    CreatedAt = vehicleFleetLatestRequests.CreatedAt,
                    CreatedById = vehicleFleetLatestRequests.CreatedById,
                    ActionedAt = vehicleFleetLatestRequests.ActionedAt,
                    ActionedBy = vehicleFleetLatestRequests.ActionedBy,
                    Questionnaires = questionnaireList
                };

                return dto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error while retrieving Vehicle Fleet Request Id: {_currentUserService.UserId}");
                throw new ApplicationException($"Failed to retrieve Vehicle Fleet Request details. {ex.Message}");
            }
        }
    }
}
