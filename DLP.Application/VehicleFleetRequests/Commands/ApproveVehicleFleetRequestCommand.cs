using System.Data.Entity;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Domain.Enums;
using MediatR;
using Newtonsoft.Json;

namespace DLP.Application.VehicleFleetRequests.Commands
{
    public class ApproveVehicleFleetRequestCommand : IRequest<Unit>
    {
        public required string CurrentUserId { get; set; }
        public Guid VehicleFleetRequestId { get; set; }
        public string? Comments { get; set; }
        public bool NeedToSendMail { get; set; } = true;
    }

    public class ApproveVehicleFleetRequestCommandHandler : IRequestHandler<ApproveVehicleFleetRequestCommand, Unit>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;
        private readonly IMediator _mediator;
        private readonly IEmailCommunicationService _emailCommunicationService;
        public ApproveVehicleFleetRequestCommandHandler(IAppDbContext dbContext,
            IActivityLogger activityLogger,
            ICurrentUserService currentUser,
            IEmailCommunicationService emailCommunicationService,
            IMediator mediator)
        {
            _dbContext = dbContext;
            _activityLogger = activityLogger;
            _currentUser = currentUser;
            _mediator = mediator;
            _emailCommunicationService = emailCommunicationService;
        }

        public async Task<Unit> Handle(ApproveVehicleFleetRequestCommand command, CancellationToken cancellationToken)
        {
            var Unit = new Unit();
            try
            {
                var userId = _currentUser.UserId;
                //var vehicleFleetRequest = await _dbContext.VehicleFleetRequests
                //                        .Where(x => !x.IsDeleted && x.Id == command.VehicleFleetRequestId)
                //                        .FirstOrDefaultAsync();



                var vehicleFleetRequest =
                                 (from item in _dbContext.VehicleFleetRequests
                                  where item.Id == command.VehicleFleetRequestId && !item.IsDeleted
                                  select item)
                                 .FirstOrDefault();

                var vehicleFleetRequestAlreadyActive =
                                 (from item in _dbContext.VehicleFleetRequests
                                  where item.CreatedById == vehicleFleetRequest.CreatedById && item.Status == (int)VehicleFleetRequestStatus.Confirmed && !item.IsDeleted
                                  select item)
                                  .OrderByDescending(x => x.CreatedAt)
                                 .FirstOrDefault();

                if (vehicleFleetRequestAlreadyActive != null)
                {
                    vehicleFleetRequestAlreadyActive.Status = (int)VehicleFleetRequestStatus.Outdated;
                    vehicleFleetRequestAlreadyActive.UpdatedAt = DateTime.UtcNow;
                    vehicleFleetRequestAlreadyActive.UpdatedById = userId;

                    _dbContext.VehicleFleetRequests.Update(vehicleFleetRequestAlreadyActive);
                    await _dbContext.SaveChangesAsync(cancellationToken);
                }

                if (vehicleFleetRequest == null)
                {
                    throw new Exception($"Vehicle fleet request not found");
                }

                vehicleFleetRequest.Status = (int)VehicleFleetRequestStatus.Confirmed;
                vehicleFleetRequest.Comments = command.Comments;
                vehicleFleetRequest.ActionedAt = DateTime.UtcNow;
                vehicleFleetRequest.ActionedBy = userId;

                _dbContext.VehicleFleetRequests.Update(vehicleFleetRequest);
                await _dbContext.SaveChangesAsync(cancellationToken);

                //await _mediator.Publish(new ApproveRequestNotification(
                //vehicleFleetRequest.Id, vehicleFleetRequest.Type, vehicleFleetRequest.CertificationNumbers,
                //company.Id,
                //company.ContactPersonId,
                //companyRegTypeId, mainBranchId, newRoles, companyNeedsToBeCreated), cancellationToken);
                var user =  _dbContext.Users.Where(x => x.Id == vehicleFleetRequest.CreatedById).FirstOrDefault();
                var requestSubmittedVehicleFleet = new RequestSubmittedVehicleFleetViewModel()
                {
                    Id = vehicleFleetRequest.Id,
                    UserName = user.FullName,
                    UserEmail = user.Email,
                    UserLang = _currentUser.LanguageCode
                };

                await _emailCommunicationService.SendVehicleFleetRequestApprovedEmail(requestSubmittedVehicleFleet, cancellationToken);

                return Unit.Value;
            }
            catch (Exception ex)
            {
                var message = $"Message: {ex.Message}, Details: {JsonConvert.SerializeObject(ex)}";
                await _activityLogger.Exception(message, "Failed to approve the vehicle fleet request", _currentUser.UserId);
                throw new Exception(ex.Message);
            }
            return Unit;
        }
    }
}
