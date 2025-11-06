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
    public class AdminApprovedOfferRequestCommand : IRequest<Unit>
    {
        public required string CurrentUserId { get; set; }
        public Guid TransportRequestId { get; set; }
        public Guid TransportCarrierId { get; set; }
        public decimal? AdminApprovedPrice { get; set; }
        public decimal? ProfitMargin { get; set; }
    }

    public class AdminApprovedOfferRequestCommandHandler : IRequestHandler<AdminApprovedOfferRequestCommand, Unit>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IMediator _mediator;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly ILicenseIdGenerator _licenseIdGenerator;
        private readonly IEmailCommunicationService _emailCommunicationService;
        private readonly ITranslationService _translationService;
        private readonly ILogger<AdminApprovedOfferRequestCommandHandler> _logger;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;

        public AdminApprovedOfferRequestCommandHandler(
            IAppDbContext dbContext,
            IMediator mediator,
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            ILicenseIdGenerator licenseIdGenerator,
            IEmailCommunicationService emailCommunicationService,
            ITranslationService translationService,
            ILogger<AdminApprovedOfferRequestCommandHandler> logger,
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
        public async Task<Unit> Handle(AdminApprovedOfferRequestCommand command, CancellationToken cancellationToken)
        {
            try
            {
                // ✅ Step 1: Verify Super Administrator access
                if (_currentUser.AccessLevel != AccessLevelType.SuperAdministrator)
                {
                    _logger.LogWarning("Unauthorized offer approval attempt by User {UserId}", _currentUser.UserId);
                    throw new UnauthorizedAccessException("Only Super Administrators are allowed to approve offers.");
                }

                var transportCarriers = await _dbContext.TransportCarriers
                    .Include(x => x.TransportRequest)
                    .FirstOrDefaultAsync(x => x.Id == command.TransportCarrierId
                    && x.TransportRequestId == command.TransportRequestId
                    && x.Status == TransportCarrierStatus.Accepted
                    && !x.IsAdminApproved
                    && !x.IsDeleted, cancellationToken) ?? throw new Exception($"Transport Request {command.TransportRequestId} not found");

                if (transportCarriers != null)
                {
                    transportCarriers.AdminApprovedPrice = command.AdminApprovedPrice;
                    transportCarriers.ProfitMargin = command.ProfitMargin;
                    transportCarriers.IsAdminApproved = true;
                    transportCarriers.UpdatedAt = DateTime.UtcNow;
                    transportCarriers.UpdatedById = _currentUser.UserId;

                    _dbContext.TransportCarriers.Update(transportCarriers);
                  
                    await _activityLogger.Add(new ActivityLogDto
                    {
                        UserId = _currentUser.UserId,
                        LogTypeId = (int)LogTypeEnum.INFO,
                        Activity = "Successfully Carrier Submit Transport Request"
                    });

                    await _dbContext.SaveChangesAsync(cancellationToken);

                }

                var carrierEmailList = await _dbContext.Organizations
                             .Include(x => x.ContactPerson)
                             .Where(x => x.Type == OrganizationTypeEnum.CARRIER && !x.IsDeleted && x.Id == transportCarriers.OrganizationId)
                             .Select(u => new CarrierOfferResultEmailViewModel
                             {
                                 Email = u.ContactPerson.Email ?? "",
                                 FullName = u.ContactPerson.FullName ?? "Carrier User",
                                 UserLang = u.ContactPerson.LanguageId.ToString() ?? "en",
                                 RequestId = transportCarriers.TransportRequest.RequestId,
                                 EvaluationResult = "Accepted"
                             })
                             .FirstOrDefaultAsync(cancellationToken);

                await _emailCommunicationService.SendAdminApprovalEmail(carrierEmailList, cancellationToken);

                return Unit.Value;
            }
            catch (Exception ex)
            {
                var message = $"Message: {ex.Message}, Details: {JsonConvert.SerializeObject(ex)}";
                await _activityLogger.Exception(message, "Failed to Carrier Submit Transport Request", _currentUser.UserId);
                throw new Exception(ex.Message);
            }
        }
    }
}
