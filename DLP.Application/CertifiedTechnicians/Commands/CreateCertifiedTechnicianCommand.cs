using DLP.Application.ActivityLogs.Dto;
using DLP.Application.CertifiedTechnicians.Notifications;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Application.Qualifications.Commands;
using DLP.Application.Users.Commands;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DLP.Application.CertifiedTechnicians.Commands
{
    public class CreateCertifiedTechnicianCommand : IRequest<Unit>
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public Guid LanguageId { get; set; }
        public Guid MunicipalityId { get; set; }
        public string PlaceOfBirth { get; set; }
        public string Address { get; set; }
        public string PersonalNumber { get; set; }
        public Guid OrganizationId { get; set; }
        public string DateOfExam { get; set; }
        public string CertificateNumber { get; set; }
        public string CertificateDuration { get; set; }
        public Guid QualificationTypeId { get; set; }
        public string Comments { get; set; }
        public List<IFormFile> Files { get; set; } = new List<IFormFile>();
    }

    public class CreateCertifiedTechnicianCommandHandler : IRequestHandler<CreateCertifiedTechnicianCommand, Unit>
    {
        private readonly IAppDbContext _dbContext;
        private readonly ILogger<CreateCertifiedTechnicianCommandHandler> _logger;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUserService;
        private readonly BetaDbContext _betaDbContext;
        private readonly IMediator _mediator;
        private readonly GammaDbContext _gammaDbContext;
        private readonly DeltaDbContext _deltaDbContext;

        public CreateCertifiedTechnicianCommandHandler(IAppDbContext dbContext,
            ILogger<CreateCertifiedTechnicianCommandHandler> logger, IActivityLogger activityLogger,
            ICurrentUserService currentUserService, BetaDbContext betaDbContext, IMediator medaitor,
            GammaDbContext gammaDbContext, DeltaDbContext deltaDbContext)
        {
            _dbContext = dbContext;
            _logger = logger;
            _activityLogger = activityLogger;
            _currentUserService = currentUserService;
            _betaDbContext = betaDbContext;
            _mediator = medaitor;
            _gammaDbContext = gammaDbContext;
            _deltaDbContext = deltaDbContext;
        }

        public async Task<Unit> Handle(CreateCertifiedTechnicianCommand request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            var organizationId = _currentUserService.OrganizationId.Value;
            using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                await _mediator.Send(new CreateUserCommand
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    Address = request.Address,
                    IsCertifiedTechnician = true,
                    Comments = request.Comments,
                    PlaceOfBirth = request.PlaceOfBirth,
                    PersonalNumber = request.PersonalNumber,
                    MunicipalityId = request.MunicipalityId,
                    CreatedById = _currentUserService.UserId,
                    LanguageId = request.LanguageId,
                    OrganizationId = organizationId,
                    //UserGroups = new List<string> { PredefinedUserGroups.CERTIFIED_TECHNICANS },
                }, cancellationToken);

                var createdUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == request.Email,
                    cancellationToken: cancellationToken);
                var technicianId = createdUser.Id;

                if (createdUser == null)
                { 
                    errorMessage = "Technician couldn't be created!";
                    throw new Exception(errorMessage);
                }
                var filesResponse = await _mediator.Send(new CreateQualificationCommand
                {
                    CertifiedTechnicianId = technicianId,
                    CertificateNumber = request.CertificateNumber,
                    QualificationTypeId = request.QualificationTypeId,
                    TrainingCenterId = organizationId,
                    DateOfExam = request.DateOfExam,
                    CertificateDuration = request.CertificateDuration,
                    Files = request.Files,
                    IgnoreSendingNotifications = true,
                }, cancellationToken);

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Certified technician {request.FirstName} {request.LastName} created successfully"
                });

                await transaction.CommitAsync(cancellationToken);
                await _mediator.Publish(new AddCertifiedTechnicianNotification(createdUser.Id, filesResponse), cancellationToken);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);

                _logger.LogError(ex, "An error occurred while handling the Create Certified Technician");
                await _activityLogger.Exception(ex.Message, "An error occurred while creating the certified technician",
                    _currentUserService.UserId);
                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }

            return Unit.Value;
        }
    }
}