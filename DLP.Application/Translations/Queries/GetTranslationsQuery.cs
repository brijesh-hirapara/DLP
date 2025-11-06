using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Translations.Response;
using MediatR;
using DLP.Application.Common.Pagination;
using DLP.Application.Translations.DTOs;

namespace DLP.Application.Translations.Queries
{
    public class GetTranslationsQuery : IRequest<PaginatedList<TranslationRecordResponse>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string Search { get; set; }
    }

    public class GetTranslationsQueryHandler : IRequestHandler<GetTranslationsQuery, PaginatedList<TranslationRecordResponse>>
    {
        private readonly IAppDbContext _context;

        public GetTranslationsQueryHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedList<TranslationRecordResponse>> Handle(GetTranslationsQuery request, CancellationToken cancellationToken)
        {
            var Languages = _context.Languages.ToList();

            return _context.Translations.AsEnumerable()
                                        .GroupBy(p => p.Key)
                                        .Select(g => new TranslationRecordResponse
                                        {
                                            Key = g.Key,
                                            Translations = (from language in Languages
                                                            join translation in g.ToList()
                                                                on language.Id equals translation.LanguageId into grouping
                                                            from translation in grouping.DefaultIfEmpty()
                                                            orderby language.Position
                                                            select new TranslationDto
                                                            {
                                                                LanguageId = language.Id,
                                                                Key = g.Key,
                                                                Value = translation != null ? translation.Value : String.Empty
                                                            }).ToList()
                                        }).Where(r =>
                                            string.IsNullOrEmpty(request.Search) ||
                                               r.Key.ToLower().Trim().Contains(request.Search.ToLower().Trim()) ||
                                                r.Translations.Any(t => t.Value.ToLower().Trim().Contains(request.Search.ToLower().Trim()))
                                        ).OrderBy(x => x.Key)
                                        .PaginatedListAsync(request.PageNumber, request.PageSize);
        }
    }
}
