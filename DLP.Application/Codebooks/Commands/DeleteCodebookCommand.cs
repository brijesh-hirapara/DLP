using DLP.Application.Codebooks.NotificationModels;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.Codebooks.Commands
{
    public class DeleteCodebookCommand : IRequest
    {
        public Guid Id { get; set; }
    }

    public class DeleteCodebookCommandHandler : IRequestHandler<DeleteCodebookCommand>
    {
        private readonly IAppDbContext _dbContext;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMediator _mediator;
        private readonly IEmailCommunicationService _emailService;

        public DeleteCodebookCommandHandler(IAppDbContext dbContext, ICurrentUserService currentUserService, IMediator mediator, IEmailCommunicationService emailService)
        {
            _dbContext = dbContext;
            _currentUserService = currentUserService;
            _mediator = mediator;
            _emailService = emailService;
        }

        public async Task Handle(DeleteCodebookCommand request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            try
            {
                errorMessage = "Invalid codebook id!";
                var codebook = await _dbContext.Codebooks.FindAsync(request.Id) ?? throw new Exception(errorMessage);

                var updatedById = _currentUserService.UserId;

                codebook.IsDeleted = true;
                codebook.UpdatedAt = DateTime.UtcNow;
                codebook.UpdatedById = updatedById;
                codebook.ActionTakenBy = updatedById;

                codebook.BeforeLocalSync();
                _dbContext.Codebooks.Update(codebook);
                await _dbContext.SaveChangesAsync(cancellationToken);
                await _mediator.Publish(new UpdateCodebookNotification(codebook, CodebookActionEnum.DELETE), cancellationToken);

                await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
                {
                    CodebookName = "Codebook => " + codebook.Name,
                    UserLang = _currentUserService.LanguageCode,
                    Username = _currentUserService.UserName,
                    ActionType = CodebookActionEnum.DELETE
                }, cancellationToken);

            }
            catch (Exception ex)
            {
                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }
        }
    }
}