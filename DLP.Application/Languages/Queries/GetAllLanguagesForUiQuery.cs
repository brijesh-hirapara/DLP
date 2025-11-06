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
    public class GetAllLanguagesForUiQuery : IRequest<List<LanguageForUiDto>>
    {
    }

    public class GetLanguagesForUiQueryHandler : IRequestHandler<GetAllLanguagesForUiQuery, List<LanguageForUiDto>>
    {
        private readonly IAppDbContext _context;

        public GetLanguagesForUiQueryHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<List<LanguageForUiDto>> Handle(GetAllLanguagesForUiQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var languages = await _context.Languages
                     .Include(r => r.I18nCode)
                    .ProjectToListAsync<LanguageForUiDto>();

                return languages;
            }
            catch (Exception e)
            {
                throw;
            }
        }
    }
}
