using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Cantons.Notifications;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.Cantons.Commands
{
    public class UpdateCantonCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid StateEntityId { get; set; }
    }

    public class UpdateCantonCommandHandler : IRequestHandler<UpdateCantonCommand, Unit>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IEmailCommunicationService _emailService;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMediator _mediator;

        public UpdateCantonCommandHandler(IAppDbContext dbContext, IEmailCommunicationService emailService, IActivityLogger logger, ICurrentUserService currentUserService, IMediator mediator)
        {
            _dbContext = dbContext;
            _emailService = emailService;
            _logger = logger;
            _currentUserService = currentUserService;
            _mediator = mediator;
        }

        public async Task<Unit> Handle(UpdateCantonCommand request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            try
            {
                errorMessage = "Invalid Canton";
                var canton = await _dbContext.Cantons.FindAsync(new object?[] { request.Id }, cancellationToken: cancellationToken)
                            ?? throw new Exception(errorMessage);

                canton.Name = request.Name;
                canton.StateEntityId = request.StateEntityId;

                canton.BeforeLocalSync();
                _dbContext.Cantons.Update(canton);
                await _dbContext.SaveChangesAsync(cancellationToken);

                await _mediator.Publish(new UpdateCantonNotification(canton), cancellationToken);

                await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
                {
                    CodebookName = "Canton => " + canton.Name,
                    UserLang = _currentUserService.LanguageCode,
                    Username = _currentUserService.UserName,
                    ActionType = Domain.Enums.CodebookActionEnum.UPDATE
                }, cancellationToken);
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, $"Failed to update canton with ID {request.Id}", _currentUserService.UserId);
                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }

            return Unit.Value;
        }
    }

}