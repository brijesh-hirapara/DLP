using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Languages.DTOs;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;


namespace DLP.Application.Languages.Queries
{
    public class GetLanguagesQuery : IRequest<List<LanguageDto>>
    {
        public string search { get; set; }
    }

    public class GetLanguagesQueryHandler : IRequestHandler<GetLanguagesQuery, List<LanguageDto>>
    {
        private readonly IAppDbContext _context;

        public GetLanguagesQueryHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<List<LanguageDto>> Handle(GetLanguagesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var languages = await _context.Languages
                    .Include(r => r.I18nCode)
                    .Include(r => r.Translations)
                    .OrderBy(r => r.Position)
                    .ProjectToListAsync<LanguageDto>();

                return languages;
            }
            catch (Exception e)
            {
                throw;
            }
        }
    }
}
