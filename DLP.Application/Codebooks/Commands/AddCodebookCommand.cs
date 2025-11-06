using DLP.Application.Codebooks.NotificationModels;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.Codebooks.Commands
{
    public class AddCodebookCommand : IRequest<Guid>
    {
        public string Name { get; set; }
        public CodebookTypeEnum Type { get; set; }
    }

    public class AddCodebookCommandHandler : IRequestHandler<AddCodebookCommand, Guid>
    {
        private readonly IAppDbContext _dbContext;
        private readonly ICurrentUserService _currentUserService;
        private readonly IEmailCommunicationService _emailService;
        private readonly IMediator _mediator;

        public AddCodebookCommandHandler(IAppDbContext dbContext, ICurrentUserService currentUserService, IEmailCommunicationService emailService, IMediator mediator)
        {
            _dbContext = dbContext;
            _currentUserService = currentUserService;
            _emailService = emailService;
            _mediator = mediator;
        }

        public async Task<Guid> Handle(AddCodebookCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var userId = _currentUserService.UserId;

                var codebook = new Codebook
                {
                    IsDeleted = false,
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    Type = request.Type,
                    CreatedById = userId,
                    ActionTakenBy = userId,
                };

                codebook.BeforeLocalSync();

                _ = _dbContext.Codebooks.Add(codebook);
                await _dbContext.SaveChangesAsync(cancellationToken);

                await _mediator.Publish(new AddCodebookNotification(codebook), cancellationToken);

                await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
                {
                    CodebookName = "Codebook => " + codebook.Name,
                    UserLang = _currentUserService.LanguageCode,
                    Username = _currentUserService.UserName,
                    ActionType = Domain.Enums.CodebookActionEnum.ADD
                }, cancellationToken);


                return codebook.Id;
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }
    }
}