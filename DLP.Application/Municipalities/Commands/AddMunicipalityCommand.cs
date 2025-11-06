using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.Municipalities.NotificationModels;
using DLP.Domain.Entities;
using MediatR;

namespace DLP.Application.Municipalities.Commands
{

    public class AddNewMunicipalityCommand : IRequest
    {
        public string Name { get; set; }
        public Guid? CantonId { get; set; } 
        public Guid StateEntityId { get; set; }
    }

    public class AddNewMunicipalityCommandHandler : IRequestHandler<AddNewMunicipalityCommand>
    {
        private readonly IAppDbContext _dbContext;
        private readonly ICurrentUserService _currentUserService;
        private readonly IEmailCommunicationService _emailService;
        private readonly IMediator _mediator;

        public AddNewMunicipalityCommandHandler(IAppDbContext dbContext, ICurrentUserService currentUserService, IEmailCommunicationService emailService, IMediator mediator)
        {
            _dbContext = dbContext;
            _currentUserService = currentUserService;
            _emailService = emailService;
            _mediator = mediator;
        }

        public async Task Handle(AddNewMunicipalityCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserId;
            try
            {
                var municipality = new Municipality
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    CantonId = request.CantonId,
                    StateEntityId = request.StateEntityId,
                    ActionTakenBy = userId,
                };

                _dbContext.Municipalities.Add(municipality);
                await _dbContext.SaveChangesAsync(cancellationToken);
                municipality.BeforeLocalSync();

                await _mediator.Publish(new AddMunicipalityNotification(municipality), cancellationToken);
                await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
                {
                    CodebookName = "Municipality Types => " + municipality.Name,
                    UserLang = _currentUserService.LanguageCode,
                    Username = _currentUserService.UserName,
                    ActionType = Domain.Enums.CodebookActionEnum.ADD
                }, cancellationToken);
            }
            catch (Exception e)
            {
                throw;
            }

        }
    }
}