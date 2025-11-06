using DLP.Application.Common.Interfaces;
using DLP.Application.Notifications.Notifications;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Languages.Commands
{
    public class AddLanguageCommand : IRequest<Unit>
    {
        public int Position { get; set; }
        public Guid I18nCodeId { get; set; }
        public bool IsDefault { get; set; }

    }

    public class AddLanguageCommandHandler : IRequestHandler<AddLanguageCommand, Unit>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUserService;

        public AddLanguageCommandHandler(IAppDbContext context, IActivityLogger logger, IMediator mediator, ICurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _mediator = mediator;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(AddLanguageCommand request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            var existingLanguage = _context.Languages.FirstOrDefault(r => r.I18nCodeId == request.I18nCodeId);

            try
            {
                if (existingLanguage != null)
                {
                    errorMessage = "Language already exists";
                    throw new Exception(errorMessage);
                }
                if (request.IsDefault)
                    await _context.Languages.ExecuteUpdateAsync(x => x.SetProperty(z => z.IsDefault, false), cancellationToken);

                var language = new Domain.Entities.Language
                {
                    Id = Guid.NewGuid(),
                    Position = request.Position,
                    I18nCodeId = request.I18nCodeId,
                    IsDefault = request.IsDefault,
                    ActionTakenBy = _currentUserService.UserId,
                    SyncToken = Guid.NewGuid(),
                    LastSyncAt = DateTime.UtcNow,
                };

                _context.Languages.Add(language);

                await _context.SaveChangesAsync(cancellationToken);
                await _mediator.Publish(new AddLanguageNotification(language), cancellationToken);

                return Unit.Value;
            }
            catch (Exception ex)
            {
                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }

        }
    }
}
