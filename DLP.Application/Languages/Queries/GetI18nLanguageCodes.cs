using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Languages.DTOs;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Languages.Queries
{
    public class GetI18nLanguageCodes : IRequest<List<I18nLanguageCodeDto>>
    {
        public string Search { get; set; }
    }

    public class GetI18nLanguageCodesHandler : IRequestHandler<GetI18nLanguageCodes, List<I18nLanguageCodeDto>>
    {
        private readonly IAppDbContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;

        public GetI18nLanguageCodesHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<List<I18nLanguageCodeDto>> Handle(GetI18nLanguageCodes request, CancellationToken cancellationToken)
        {
            var installedLanguages = await _context.Languages.Select(x => x.I18nCodeId).ToListAsync(cancellationToken);
            var languageCodes = await _context.I18nLanguageCodes.Where(x => !installedLanguages.Any(z => z == x.Id))
                .ProjectToListAsync<I18nLanguageCodeDto>();

            return languageCodes;
        }
    }
}
