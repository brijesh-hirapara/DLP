using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.Municipalities.NotificationModels;
using DLP.Domain.Entities;
using MediatR;

namespace DLP.Application.Municipalities.Commands
{
    public class DeleteMunicipalityCommand : IRequest
    {
        public Guid Id { get; set; }
    }

    public class DeleteMunicipalityCommandHandler : IRequestHandler<DeleteMunicipalityCommand>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IEmailCommunicationService _emailService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMediator _mediator;

        public DeleteMunicipalityCommandHandler(IAppDbContext dbContext, IEmailCommunicationService emailService, ICurrentUserService currentUserService, IMediator mediator)
        {
            _dbContext = dbContext;
            _emailService = emailService;
            _currentUserService = currentUserService;
            _mediator = mediator;
        }

        public async Task Handle(DeleteMunicipalityCommand request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            try
            {
                errorMessage = "Invalid Municipality";
                var municipality = await _dbContext.Municipalities.FindAsync(new object?[] { request.Id }, cancellationToken: cancellationToken) ?? throw new Exception(errorMessage);

                municipality.BeforeLocalSync();
                _dbContext.Municipalities.Remove(municipality);
                await _dbContext.SaveChangesAsync(cancellationToken);

                await _mediator.Publish(new DeleteMunicipalityNotification(municipality.Id), cancellationToken);

                await _emailService.CodebookChangeNotification(new CodebookChangeViewModel
                {
                    CodebookName = "Municipality => " + municipality.Name,
                    UserLang = _currentUserService.LanguageCode,
                    Username = _currentUserService.UserName,
                    ActionType = Domain.Enums.CodebookActionEnum.DELETE
                }, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }

        }
    }
}