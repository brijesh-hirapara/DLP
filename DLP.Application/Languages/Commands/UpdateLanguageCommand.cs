using DLP.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Languages.Commands
{
    public class UpdateLanguageCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public int Position { get; set; }
        public bool IsDefault { get; set; }
    }

    public class UpdateLanguageCommandHandler : IRequestHandler<UpdateLanguageCommand, Unit>
    {
        private readonly IAppDbContext _context;

        public UpdateLanguageCommandHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(UpdateLanguageCommand request, CancellationToken cancellationToken)
        {
            var existingLanguage = await _context.Languages.FirstOrDefaultAsync(r => r.Id == request.Id);

            if (existingLanguage != null)
            {
                if (request.IsDefault)
                {
                    await _context.Languages.Where(z => z.Id != existingLanguage.Id).ExecuteUpdateAsync(x => x.SetProperty(z => z.IsDefault, false), cancellationToken);
                    existingLanguage.IsDefault = request.IsDefault;
                }

                if (existingLanguage.Position != request.Position)
                {
                    var previousPosition = existingLanguage.Position;
                    var languagesToAdjust = _context.Languages.Where(lang => lang.Id != existingLanguage.Id);

                    foreach (var lang in languagesToAdjust)
                    {
                        if (request.Position < previousPosition)
                        {
                            if (lang.Position >= request.Position && lang.Position < previousPosition)
                            {
                                lang.Position++;
                            }
                        }
                        else
                        {
                            if (lang.Position <= request.Position && lang.Position > previousPosition)
                            {
                                // Ensure the position does not go below 1
                                lang.Position = Math.Max(1, lang.Position - 1);
                            }
                        }
                    }

                    // Update the existing language's position
                    existingLanguage.Position = request.Position;
                }

                await _context.SaveChangesAsync(cancellationToken);
            }
            else
            {
                throw new Exception("Language not found");
            }

            return Unit.Value;
        }
    }
}
