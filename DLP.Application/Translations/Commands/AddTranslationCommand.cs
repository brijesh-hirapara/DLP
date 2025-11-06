using DLP.Application.Common.Interfaces;
using DLP.Application.Translations.Notifications;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Translations.Commands
{
    public class AddTranslationCommand : IRequest<Unit>
    {
        public string Key { get; set; }
        public string Value { get; set; }
        public string Language { get; set; }
    }

    public class AddTranslationCommandHandler : IRequestHandler<AddTranslationCommand, Unit>
    {
        private readonly IAppDbContext _context;
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUserService;

        public AddTranslationCommandHandler(IAppDbContext context, IMediator mediator, ICurrentUserService currentUserService)
        {
            _context = context;
            _mediator = mediator;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(AddTranslationCommand request, CancellationToken cancellationToken)
        {
            var hasExistingTranslations = _context.Translations.Include(r => r.Language).Any(r => r.Key == request.Key);
            var defaultLanguage = _context.Languages.Include(r => r.I18nCode).FirstOrDefault(r => r.I18nCode.Code == request.Language);

            if (!hasExistingTranslations && request.Value != "undefined" && request.Value != "null")
            {
                var translation = new Translation
                {
                    Key = request.Key,
                    Value = request.Key == request.Value ? string.Empty : request.Value,
                    LanguageId = defaultLanguage.Id,
                    SyncToken = Guid.NewGuid(),
                    LastSyncAt = DateTime.UtcNow,
                    ActionTakenBy = _currentUserService.UserId
                };

                _context.Translations.Add(translation);

                await _context.SaveChangesAsync(cancellationToken);
                await _mediator.Publish(new AddTranslationNotification(translation), cancellationToken);
            }

            return Unit.Value;
        }
    }
}
