using DLP.Application.Common.Interfaces;
using DLP.Application.Translations.DTOs;
using DLP.Application.Translations.Notifications;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace DLP.Application.Translations.Commands
{
    public class UpdateTranslationCommand : IRequest<Unit>
    {
        public string Key { get; set; }
        public List<TranslationDto> Translations { get; set; }
    }

    public class UpdateTranslationCommandHandler : IRequestHandler<UpdateTranslationCommand, Unit>
    {
        private readonly IAppDbContext _context;
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUserService;

        public UpdateTranslationCommandHandler(IAppDbContext context, IMediator mediator, ICurrentUserService currentUserService)
        {
            _context = context;
            _mediator = mediator;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(UpdateTranslationCommand request, CancellationToken cancellationToken)
        {

            foreach (var translation in request.Translations)
            {
                var existingTranslation = _context.Translations.FirstOrDefault(r => r.Key == request.Key && r.LanguageId == translation.LanguageId);

                if (existingTranslation != null)
                {
                    existingTranslation.Value = translation.Value;
                    existingTranslation.LastSyncAt = DateTime.UtcNow;
                    existingTranslation.SyncToken = Guid.NewGuid();
                    existingTranslation.ActionTakenBy = _currentUserService.UserId;
                    await _mediator.Publish(new UpdateTranslationNotification(existingTranslation), cancellationToken);
                }
                else
                {
                    var data = new Translation
                    {
                        Key = request.Key,
                        Value = translation.Value,
                        LanguageId = translation.LanguageId,
                        LastSyncAt = DateTime.UtcNow,
                        SyncToken = Guid.NewGuid(),
                        ActionTakenBy = _currentUserService.UserId,
                    };

                    await _context.Translations.AddAsync(data,cancellationToken);
                    await _mediator.Publish(new AddTranslationNotification(data), cancellationToken);
                }

                await _context.SaveChangesAsync(cancellationToken);
            }

            return Unit.Value;
        }
    }
}
