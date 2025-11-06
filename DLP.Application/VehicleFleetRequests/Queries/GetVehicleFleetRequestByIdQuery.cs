using DLP.Application.Common.Interfaces;
using DLP.Application.Requests.DTOs;
using DLP.Application.VehicleFleetRequests.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using static DLP.Application.Common.Auth.CustomPolicies;

namespace DLP.Application.VehicleFleetRequests.Queries
{
    public class GetVehicleFleetRequestByIdQuery : IRequest<VehicleFleetRequestDetailDto>
    {
        public Guid VehicleFleetRequestId { get; set; }
    }

    public class GetVehicleFleetRequestByIdQueryHandler
        : IRequestHandler<GetVehicleFleetRequestByIdQuery, VehicleFleetRequestDetailDto>
    {
        private readonly IAppDbContext _dbContext;
        private readonly ILogger<GetVehicleFleetRequestByIdQueryHandler> _logger;

        public GetVehicleFleetRequestByIdQueryHandler(IAppDbContext dbContext, ILogger<GetVehicleFleetRequestByIdQueryHandler> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<VehicleFleetRequestDetailDto> Handle(GetVehicleFleetRequestByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Fetch main request
                var entity = await _dbContext.VehicleFleetRequests
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r => r.Id == request.VehicleFleetRequestId && !r.IsDeleted, cancellationToken);

                if (entity == null)
                    throw new ApplicationException($"Vehicle Fleet Request not found with Id: {request.VehicleFleetRequestId}");

                // Fetch related questionnaires                
                var questionnaireList = await _dbContext.Questionnaire
                    .AsNoTracking()
                    .Where(q => q.RequestId == entity.Id.ToString() && q.ModuleName == "VehicleFleetRequest")
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
                    Id = entity.Id,
                    Status = (VehicleFleetRequestStatus)entity.Status,
                    StatusText = ((VehicleFleetRequestStatus)entity.Status).ToString(),
                    Comments = entity.Comments,
                    CreatedAt = entity.CreatedAt,
                    CreatedById = entity.CreatedById,
                    Questionnaires = questionnaireList,
                    ActionedAt = entity.ActionedAt,
                    ActionedBy = entity.ActionedBy,
                    ActionedName = !string.IsNullOrEmpty(entity.ActionedBy)
                                ? _dbContext.Users
                                    .Where(x => x.Id == entity.ActionedBy)
                                    .Select(x => x.FullName)
                                    .FirstOrDefault()
                                : null
                };

                return dto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error while retrieving Vehicle Fleet Request Id: {request.VehicleFleetRequestId}");
                throw new ApplicationException($"Failed to retrieve Vehicle Fleet Request details. {ex.Message}");
            }
        }
    }
}
