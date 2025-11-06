using DLP.Application.Common.Interfaces;
using MapsterMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;


namespace DLP.Application.Translations.Queries
{
    public class GetLanguageTranslationsQuery : IRequest<Dictionary<string, string>>
    {
        public string Language { get; set; }
    }

    public class GetLanguageTranslationsQueryHandler : IRequestHandler<GetLanguageTranslationsQuery, Dictionary<string, string>>
    {
        private readonly IAppDbContext _context;

        public GetLanguageTranslationsQueryHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Dictionary<string, string>> Handle(GetLanguageTranslationsQuery request, CancellationToken cancellationToken)
        {

            return await _context.Translations.Include(r => r.Language)
                                                .ThenInclude(r => r.I18nCode)
                                              .Where(r => request.Language.StartsWith(r.Language.I18nCode.Code))
                                              .ToDictionaryAsync(x => x.Key, x => x.Value);
        }
    }
}
