using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace DLP.Application.VehicleFleetRequests.Commands
{
    public class UpdateVehicleFleetRequestCommand : IRequest<string>
    {
        public Guid VehicleFleetRequestId { get; set; }
        public string QuestionnaireListJson { get; set; } = string.Empty;
    }

    public class UpdateVehicleFleetRequestCommandHandler : IRequestHandler<UpdateVehicleFleetRequestCommand, string>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;
        private readonly ILogger<UpdateVehicleFleetRequestCommandHandler> _logger;

        public UpdateVehicleFleetRequestCommandHandler(
            IAppDbContext dbContext,
            IActivityLogger activityLogger,
            ICurrentUserService currentUser,
            ILogger<UpdateVehicleFleetRequestCommandHandler> logger)
        {
            _dbContext = dbContext;
            _activityLogger = activityLogger;
            _currentUser = currentUser;
            _logger = logger;
        }

        public async Task<string> Handle(UpdateVehicleFleetRequestCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var existingRequest = await _dbContext.VehicleFleetRequests
                    .FirstOrDefaultAsync(r => r.Id == command.VehicleFleetRequestId && !r.IsDeleted, cancellationToken);

                if (existingRequest == null)
                    throw new ApplicationException($"Vehicle Fleet Request not found with Id: {command.VehicleFleetRequestId}");

                // Example: Update metadata (status, updated date, etc.)
                existingRequest.UpdatedAt = DateTime.UtcNow;
                existingRequest.UpdatedById = _currentUser.UserId;

                _dbContext.VehicleFleetRequests.Update(existingRequest);

                // Remove existing Questionnaire entries for this request
                var existingQuestionnaires = await _dbContext.Questionnaire
                    .Where(q => q.RequestId == existingRequest.Id.ToString() && q.ModuleName == "VehicleFleetRequest")
                    .ToListAsync(cancellationToken);

                if (existingQuestionnaires.Any())
                {
                    _dbContext.Questionnaire.RemoveRange(existingQuestionnaires);
                    await _dbContext.SaveChangesAsync(cancellationToken);
                }

                // Deserialize updated Questionnaire data
                var questionnaires = JsonConvert.DeserializeObject<List<QuestionnaireRequestParameter>>(command.QuestionnaireListJson);

                if (questionnaires != null && questionnaires.Count > 0)
                {
                    var objQuestionnaires = questionnaires.Select(q => new Questionnaire
                    {
                        Id = Guid.NewGuid(),
                        RequestId = existingRequest.Id.ToString(),
                        RequestType = "RegistraterAsCarrier",
                        QuestionNo = q.QuestionNo,
                        Values = q.Values,
                        CodebookId = string.IsNullOrEmpty(q.CodebookId) ? (Guid?)null : Guid.Parse(q.CodebookId),
                        TrailerQTY = q.TrailerQTY,
                        CountryId = string.IsNullOrEmpty(q.CountryId) ? (Guid?)null : Guid.Parse(q.CountryId),
                        ModuleName = "VehicleFleetRequest"
                    }).ToList();

                    await _dbContext.Questionnaire.AddRangeAsync(objQuestionnaires, cancellationToken);
                }

                await _dbContext.SaveChangesAsync(cancellationToken);

                return "Vehicle Fleet Request updated successfully.";
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Vehicle Fleet Request update failed!", _currentUser.UserId);
                _logger.LogError(ex, "Error occurred while updating Vehicle Fleet Request");

                throw new ApplicationException(
                    $"Update failed with error: {ex.InnerException?.Message ?? ex.Message}");
            }
        }
    }
}
