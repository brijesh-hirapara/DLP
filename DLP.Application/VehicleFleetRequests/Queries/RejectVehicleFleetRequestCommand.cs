using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.Requests.Commands;
using DLP.Domain.Enums;
using MediatR;
using Newtonsoft.Json;
using System.Data.Entity;

namespace DLP.Application.VehicleFleetRequests.Queries
{
    public class RejectVehicleFleetRequestCommand : IRequest<Unit>
    {
        public required string CurrentUserId { get; set; }
        public Guid VehicleFleetRequestId { get; set; }
        public string? Comments { get; set; }
        public bool NeedToSendMail { get; set; } = true;
    }

    public class RejectVehicleFleetRequestCommandHandler : IRequestHandler<RejectVehicleFleetRequestCommand, Unit>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;
        private readonly IEmailCommunicationService _emailCommunicationService;
        public RejectVehicleFleetRequestCommandHandler(IAppDbContext dbContext,
            IActivityLogger activityLogger,
            ICurrentUserService currentUser,
            IEmailCommunicationService emailCommunicationService)
        {
            _dbContext = dbContext;
            _activityLogger = activityLogger;
            _currentUser = currentUser;
            _emailCommunicationService = emailCommunicationService;
        }

        public async Task<Unit> Handle(RejectVehicleFleetRequestCommand command, CancellationToken cancellationToken)
        {
            var Unit = new Unit();
            try
            {
                var userId = _currentUser.UserId;
                //var vehicleFleetRequest = await _dbContext.VehicleFleetRequests
                //                        .FirstOrDefaultAsync(x => !x.IsDeleted && x.Id == command.VehicleFleetRequestId)
                //                        ?? throw new Exception($"Vehicle fleet request not found");

                var vehicleFleetRequest =
                                 (from item in _dbContext.VehicleFleetRequests
                                  where item.Id == command.VehicleFleetRequestId && !item.IsDeleted
                                  select item)
                                 .FirstOrDefault();

                if (vehicleFleetRequest == null)
                {
                    throw new Exception($"Vehicle fleet request not found");
                }

                vehicleFleetRequest.Status = (int)VehicleFleetRequestStatus.Rejected;
                vehicleFleetRequest.Comments = command.Comments;
                vehicleFleetRequest.ActionedAt = DateTime.UtcNow;
                vehicleFleetRequest.ActionedBy = userId;

                _dbContext.VehicleFleetRequests.Update(vehicleFleetRequest);
                await _dbContext.SaveChangesAsync(cancellationToken);

                var user =  _dbContext.Users.Where(x => x.Id == vehicleFleetRequest.CreatedById).FirstOrDefault();
                var requestSubmittedVehicleFleet = new RequestSubmittedVehicleFleetViewModel()
                {
                    Id = vehicleFleetRequest.Id,
                    UserName = user.FullName,
                    UserEmail = user.Email,
                    Reasons = command.Comments,
                    UserLang = _currentUser.LanguageCode
                };

                await _emailCommunicationService.SendVehicleFleetRequestRejectedEmail(requestSubmittedVehicleFleet, cancellationToken);

                return Unit.Value;
            }
            catch (Exception ex)
            {
                var message = $"Message: {ex.Message}, Details: {JsonConvert.SerializeObject(ex)}";
                await _activityLogger.Exception(message, "Failed to reject the vehicle fleet request", _currentUser.UserId);
                throw new Exception(ex.Message);
            }
            return Unit;
        }
    }
}
