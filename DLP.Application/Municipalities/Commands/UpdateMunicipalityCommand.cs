using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.Municipalities.NotificationModels;
using DLP.Domain.Entities;
using MediatR;

namespace DLP.Application.Municipalities.Commands
{
    public class UpdateMunicipalityCommand : IRequest
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid? CantonId { get; set; } // Foreign key, nullable
        public Guid StateEntityId { get; set; } // Foreign key
    }
    public class UpdateMunicipalityCommandHandler : IRequestHandler<UpdateMunicipalityCommand>
    {
        private readonly IAppDbContext _dbContext;
        private readonly ICurrentUserService _currentUserService;
        private readonly IEmailCommunicationService _emailService;
        private readonly IMediator _mediator;

        public UpdateMunicipalityCommandHandler(IAppDbContext dbContext, ICurrentUserService currentUserService, IEmailCommunicationService emailService, IMediator mediator)
        {
            _dbContext = dbContext;
            _currentUserService = currentUserService;
            _emailService = emailService;
            _mediator = mediator;
        }

        public async Task Handle(UpdateMunicipalityCommand request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            var userId = _currentUserService.UserId;
            try
            {
                errorMessage = "Invalid Municipality";
                var municipality = await _dbContext.Municipalities.FindAsync(new object?[] { request.Id }, cancellationToken: cancellationToken) ?? throw new Exception(errorMessage);

                municipality.Name = request.Name;
                municipality.CantonId = request.CantonId;
                municipality.StateEntityId = request.StateEntityId;
                municipality.ActionTakenBy = userId;

                municipality.BeforeLocalSync();
                _dbContext.Municipalities.Update(municipality);
                await _dbContext.SaveChangesAsync(cancellationToken);

                await _mediator.Publish(new UpdateMunicipalityNotification(municipality), cancellationToken);

                await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
                {
                    CodebookName = "Municipality => " + municipality.Name,
                    UserLang = _currentUserService.LanguageCode,
                    Username = _currentUserService.UserName,
                    ActionType = Domain.Enums.CodebookActionEnum.UPDATE
                },  cancellationToken);
            }
            catch (Exception ex)
            {
                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }
        }
    }
}