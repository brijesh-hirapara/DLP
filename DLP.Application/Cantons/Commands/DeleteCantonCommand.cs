using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Cantons.Notifications;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.Cantons.Commands
{
    public class DeleteCantonCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }

    public class DeleteCantonCommandHandler : IRequestHandler<DeleteCantonCommand, Unit>
    {
        private readonly IAppDbContext _dbContext;
        private readonly ICurrentUserService _currentUserService;
        private readonly IEmailCommunicationService _emailService;
        private readonly IMediator _mediator;

        public DeleteCantonCommandHandler(IAppDbContext dbContext, ICurrentUserService currentUserService, IEmailCommunicationService emailService, IMediator mediator)
        {
            _dbContext = dbContext;
            _currentUserService = currentUserService;
            _emailService = emailService;
            _mediator = mediator;
        }

        public async Task<Unit> Handle(DeleteCantonCommand request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            try
            {
                errorMessage = "Invalid Canton";
                var canton = await _dbContext.Cantons.FindAsync(new object?[] { request.Id }, cancellationToken: cancellationToken)
                            ?? throw new Exception(errorMessage);

                _dbContext.Cantons.Remove(canton);                
                await _dbContext.SaveChangesAsync(cancellationToken);

                await _mediator.Publish(new DeleteCantonNotification(canton.Id), cancellationToken);

                await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
                {
                    CodebookName = "Canton => " + canton.Name,
                    UserLang = _currentUserService.LanguageCode,
                    Username = _currentUserService.UserName,
                    ActionType = Domain.Enums.CodebookActionEnum.DELETE
                }, cancellationToken);

            }
            catch (Exception ex)
            {
                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }

            return Unit.Value;
        }
    }

}



