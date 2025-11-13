using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.Requests.Commands;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Org.BouncyCastle.Asn1.Ocsp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.VehicleFleetRequests.Commands
{
    public class CreateVehicleFleetRequestCommand : IRequest<string>
    {
        public string QuestionnaireListJson { get; set; }
    }

    public class CreateVehicleFleetRequestCommandHandler : IRequestHandler<CreateVehicleFleetRequestCommand, string>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;
        private readonly ILogger<CreateVehicleFleetRequestCommandHandler> _logger;
        private readonly IEmailCommunicationService _emailCommunicationService;
        public CreateVehicleFleetRequestCommandHandler(IAppDbContext dbContext,
            IActivityLogger activityLogger,
            ICurrentUserService currentUser,
            IEmailCommunicationService emailCommunicationService,
            ILogger<CreateVehicleFleetRequestCommandHandler> logger)
        {
            _dbContext = dbContext;
            _activityLogger = activityLogger;
            _currentUser = currentUser;
            _logger = logger;
            _emailCommunicationService = emailCommunicationService;
        }

        public async Task<string> Handle(CreateVehicleFleetRequestCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var userId = _currentUser.UserId;
                var vehicleFleetRequest = new VehicleFleetRequest()
                {
                    Id = Guid.NewGuid(),
                    Status = (int)VehicleFleetRequestStatus.Pending,
                    OrganizationId = _currentUser.OrganizationId,
                    CreatedAt = DateTime.UtcNow,
                    CreatedById = _currentUser.UserId,
                    IsDeleted = false
                };

                await _dbContext.VehicleFleetRequests.AddAsync(vehicleFleetRequest, cancellationToken);
                await _dbContext.SaveChangesAsync();

                var questionnaires = JsonConvert.DeserializeObject<List<QuestionnaireRequestParameter>>(command.QuestionnaireListJson);

                if (questionnaires != null && questionnaires.Count > 0)
                {
                    var objQuestionnaires = questionnaires.Select(q => new Questionnaire
                    {
                        Id = Guid.NewGuid(),
                        RequestId = Convert.ToString(vehicleFleetRequest.Id),
                        RequestType = "RegistraterAsCarrier",
                        QuestionNo = q.QuestionNo,
                        Values = q.Values,
                        CodebookId = string.IsNullOrEmpty(q.CodebookId) ? (Guid?)null : Guid.Parse(q.CodebookId),
                        TrailerQTY = q.TrailerQTY,
                        CountryId = string.IsNullOrEmpty(q.CountryId) ? (Guid?)null : Guid.Parse(q.CountryId),
                        ModuleName = "VehicleFleetRequest"
                    }).ToList();

                    await _dbContext.Questionnaire.AddRangeAsync(objQuestionnaires, cancellationToken);
                    await _dbContext.SaveChangesAsync();
                    var user = await _dbContext.Users.Where(x => x.Id == _currentUser.UserId).FirstOrDefaultAsync();
                    var requestSubmittedVehicleFleet = new RequestSubmittedVehicleFleetViewModel()
                    {
                        Id = vehicleFleetRequest.Id,
                        UserName = user.FullName,
                        UserEmail = user.Email,
                        UserLang = _currentUser.LanguageCode
                    };
                    await _emailCommunicationService.SendVehicleFleetRequestAdminEmail(requestSubmittedVehicleFleet, cancellationToken);
                }
                return "Vehicle Fleet Request created successfully.";
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Request couldn't be created!", _currentUser.UserId);
                _logger.LogError(ex, "An error occurred while handling the CreateRequestCommand");
                throw new ApplicationException(
                    $"Request failed to be created with error message: {ex.InnerException?.Message ?? ex.Message}");
            }
        }
    }
}
