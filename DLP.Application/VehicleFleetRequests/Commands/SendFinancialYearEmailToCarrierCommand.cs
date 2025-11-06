using System.Data.Entity;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Domain.Enums;
using MediatR;
using Newtonsoft.Json;

namespace DLP.Application.VehicleFleetRequests.Commands
{
    public class SendFinancialYearEmailToCarrierCommand : IRequest
    {

    }

    public class SendFinancialYearEmailToCarrierCommandHandler : IRequestHandler<SendFinancialYearEmailToCarrierCommand>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;
        private readonly IMediator _mediator;
        private readonly IEmailCommunicationService _emailCommunicationService;
        public SendFinancialYearEmailToCarrierCommandHandler(IAppDbContext dbContext,
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

        public async Task Handle(SendFinancialYearEmailToCarrierCommand command, CancellationToken cancellationToken)
        {
            var Unit = new Unit();
            try
            {
                var userId = _currentUser.UserId;
                // step 1: fetch all active carrier users
                var carrierusers =  _dbContext.Users
                .Include(u => u.Organization)
                .Where(u => u.IsActive && !u.IsDeleted && u.Organization.Type == OrganizationTypeEnum.CARRIER)
                .Select(u => new
                {
                    u.Email,
                    u.FullName,
                    u.LanguageId
                })
        .ToList();


                var carrierUserList = carrierusers.Select(u => new CarrierUserDetailsViewModel
                {
                    Email = u.Email,
                    FullName = u.FullName,
                    LanguageId = u.LanguageId.ToString()
                }).ToList();

                await _emailCommunicationService.SendCarrierUserFinancialYearEmail(carrierUserList, cancellationToken);

                return;
            }
            catch (Exception ex)
            {
                var message = $"Message: {ex.Message}, Details: {JsonConvert.SerializeObject(ex)}";
                await _activityLogger.Exception(message, "Failed to approve the vehicle fleet request", _currentUser.UserId);
                throw new Exception(ex.Message);
            }
            return;
        }
    }
}
