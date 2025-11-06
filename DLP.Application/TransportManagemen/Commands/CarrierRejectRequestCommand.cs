using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace DLP.Application.TransportManagemen.Commands
{
    public class CarrierRejectRequestCommand : IRequest<Unit>
    {
        public required string CurrentUserId { get; set; }
        public Guid TransportRequestId { get; set; }
        public Guid TransportCarrierId { get; set; }
    }

    public class CarrierRejectRequestCommandHandler : IRequestHandler<CarrierRejectRequestCommand, Unit>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IMediator _mediator;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly ILicenseIdGenerator _licenseIdGenerator;
        private readonly IEmailCommunicationService _emailCommunicationService;
        private readonly ITranslationService _translationService;
        private readonly ILogger<CarrierRejectRequestCommandHandler> _logger;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;

        public CarrierRejectRequestCommandHandler(
            IAppDbContext dbContext,
            IMediator mediator,
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            ILicenseIdGenerator licenseIdGenerator,
            IEmailCommunicationService emailCommunicationService,
            ITranslationService translationService,
            ILogger<CarrierRejectRequestCommandHandler> logger,
            IActivityLogger activityLogger,
            ICurrentUserService currentUser
            )
        {
            _dbContext = dbContext;
            _mediator = mediator;
            _userManager = userManager;
            _roleManager = roleManager;
            _licenseIdGenerator = licenseIdGenerator;
            _emailCommunicationService = emailCommunicationService;
            _translationService = translationService;
            _logger = logger;
            _activityLogger = activityLogger;
            _currentUser = currentUser;
        }
        public async Task<Unit> Handle(CarrierRejectRequestCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var isAdmin = _currentUser.AccessLevel == AccessLevelType.SuperAdministrator;

                var query = _dbContext.TransportCarriers
                    .Where(x => x.Id == command.TransportCarrierId
                             && x.TransportRequestId == command.TransportRequestId
                             && !x.IsDeleted);

                if (!isAdmin)
                {
                    query = query.Where(x => x.OrganizationId == _currentUser.OrganizationId);
                }

                var transportCarriers = await query.FirstOrDefaultAsync(cancellationToken)
                    ?? throw new Exception($"Transport Request {command.TransportRequestId} not found");


                if (transportCarriers != null )
                {
                    transportCarriers.Status = TransportCarrierStatus.Rejected;
                    transportCarriers.UpdatedAt = DateTime.UtcNow;
                    transportCarriers.UpdatedById = _currentUser.UserId;

                    _dbContext.TransportCarriers.Update(transportCarriers);

                    await _activityLogger.Add(new ActivityLogDto
                    {
                        UserId = _currentUser.UserId,
                        LogTypeId = (int)LogTypeEnum.INFO,
                        Activity = "Successfully Carrier Rejected Transport Request"
                    });
                }

                if (transportCarriers.IsAdminApproved && isAdmin) {

                    var carrierEmailList = await _dbContext.Organizations
                                         .Include(x => x.ContactPerson)
                                         .Where(x => x.Type == OrganizationTypeEnum.CARRIER && !x.IsDeleted && x.Id == transportCarriers.OrganizationId)
                                         .Select(u => new CarrierOfferResultEmailViewModel
                                         {
                                             Email = u.ContactPerson.Email ?? "",
                                             FullName = u.ContactPerson.FullName ?? "Carrier User",
                                             UserLang = u.ContactPerson.LanguageId.ToString() ?? "en",
                                             RequestId = transportCarriers.TransportRequest.RequestId,
                                             EvaluationResult = "Rejected"
                                         })
                                         .FirstOrDefaultAsync(cancellationToken);

                    await _emailCommunicationService.SendAdminRejectedEmail(carrierEmailList, cancellationToken);
                }

                return Unit.Value;
            }
            catch (Exception ex)
            {
                var message = $"Message: {ex.Message}, Details: {JsonConvert.SerializeObject(ex)}";
                await _activityLogger.Exception(message, "Failed to Carrier Rejected Transport Request", _currentUser.UserId);
                throw new Exception(ex.Message);
            }
        }


    }
}