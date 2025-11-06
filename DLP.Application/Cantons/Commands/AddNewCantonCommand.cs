using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Cantons.Notifications;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.Cantons.Commands
{
    public class AddNewCantonCommand : IRequest<Unit>
    {
        public string Name { get; set; }
        public Guid StateEntityId { get; set; }
    }

    public class AddNewCantonCommandHandler : IRequestHandler<AddNewCantonCommand, Unit>
    {
        private readonly IAppDbContext _dbContext;
        private readonly ICurrentUserService _currentUserService;
        private readonly IEmailCommunicationService _emailService;
        private readonly IMediator _mediator;

        public AddNewCantonCommandHandler(IAppDbContext dbContext, ICurrentUserService currentUserService, IEmailCommunicationService emailService, IMediator mediator)
        {
            _dbContext = dbContext;
            _currentUserService = currentUserService;
            _emailService = emailService;
            _mediator = mediator;
        }

        public async Task<Unit> Handle(AddNewCantonCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var canton = new Canton
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    StateEntityId = request.StateEntityId,
                    ActionTakenBy = _currentUserService.UserId,
                };

                canton.BeforeLocalSync();

                _dbContext.Cantons.Add(canton);
                await _dbContext.SaveChangesAsync(cancellationToken);

                await _mediator.Publish(new AddCantonNotification(canton), cancellationToken);

                await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
                {
                    CodebookName = "Canton => " + canton.Name,
                    UserLang = _currentUserService.LanguageCode,
                    Username = _currentUserService.UserName,
                    ActionType = Domain.Enums.CodebookActionEnum.ADD
                }, cancellationToken);

            }
            catch (Exception ex)
            {
                throw;
            }

            return Unit.Value;
        }
    }

}