using DLP.Application.Common.Interfaces;
using DLP.Application.Notifications.Notifications;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace DLP.Application.Translations.Commands
{
    public class DeleteLanguageCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }

    public class DeleteLanguageCommandHandler : IRequestHandler<DeleteLanguageCommand, Unit>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly IMediator _mediator;

        public DeleteLanguageCommandHandler(IAppDbContext context, IActivityLogger logger, IMediator mediator)
        {
            _context = context;
            _logger = logger;
            _mediator = mediator;
        }

        public async Task<Unit> Handle(DeleteLanguageCommand request, CancellationToken cancellationToken)
        {
            var existingLanguages = _context.Languages.Include(r => r.Translations).ToList();
            var defaultLanguageId = existingLanguages.First(x => x.IsDefault).Id;
            var requestActionLanguage = existingLanguages.FirstOrDefault(r => r.Id == request.Id) ?? throw new Exception("Language can not be found!");

            if (requestActionLanguage.IsDefault)
                throw new Exception("Default language can not be deleted!");

            await _context.Users.Where(z => z.LanguageId == request.Id).ExecuteUpdateAsync(x => x.SetProperty(x => x.LanguageId, defaultLanguageId),cancellationToken);

            _context.Languages.Remove(requestActionLanguage);
            await _context.SaveChangesAsync(cancellationToken);
            await _mediator.Publish(new DeleteLanguageNotification(request.Id), cancellationToken);
            return Unit.Value;
        }
    }
}
