using DLP.Application.Codebooks.NotificationModels;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.Codebooks.Commands
{
    public class UpdateCodebookCommand : IRequest
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }

    public class UpdateCodebookCommandHandler : IRequestHandler<UpdateCodebookCommand>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IEmailCommunicationService _emailService;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMediator _mediator;

        public UpdateCodebookCommandHandler(IAppDbContext dbContext, IEmailCommunicationService emailService, IActivityLogger logger, ICurrentUserService currentUserService, IMediator mediator)
        {
            _dbContext = dbContext;
            _emailService = emailService;
            _logger = logger;
            _currentUserService = currentUserService;
            _mediator = mediator;
        }

        public async Task Handle(UpdateCodebookCommand request, CancellationToken cancellationToken)
        {
            var codebook = await _dbContext.Codebooks.FindAsync(request.Id,cancellationToken) ?? throw new Exception("Invalid coodbook");
            var updatedById = _currentUserService.UserId;

            codebook.Name = request.Name;
            codebook.UpdatedById = updatedById;
            codebook.ActionTakenBy = updatedById;

            codebook.BeforeLocalSync();
            _dbContext.Codebooks.Update(codebook);
            await _dbContext.SaveChangesAsync(cancellationToken);

            await _mediator.Publish(new UpdateCodebookNotification(codebook, CodebookActionEnum.UPDATE), cancellationToken);


            await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
            {
                CodebookName = "Codebook => " + codebook.Name,
                UserLang = _currentUserService.LanguageCode,
                Username = _currentUserService.UserName,
                ActionType = CodebookActionEnum.UPDATE
            }, cancellationToken);


        }
    }

}