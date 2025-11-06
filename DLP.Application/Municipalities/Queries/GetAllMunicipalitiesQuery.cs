using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Municipalities.DTOs;
using DLP.Application.Organizations.DTOs;
using DLP.Domain.Entities;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace DLP.Application.Municipalities.Queries
{
    public class GetAllMunicipalitiesQuery : IRequest<OrdinalPaginatedList<MunicipalityDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; }
        public string SortType { get; set; }
        public string Search { get; set; }
        public bool IsFromExport { get; set; } = false;
    }

    public class GetAllMunicipalitiesQueryHandler : IRequestHandler<GetAllMunicipalitiesQuery, OrdinalPaginatedList<MunicipalityDto>>
    {
        private readonly IAppDbContext _context;

        public GetAllMunicipalitiesQueryHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<OrdinalPaginatedList<MunicipalityDto>> Handle(GetAllMunicipalitiesQuery request, CancellationToken cancellationToken)
        {
            var search = request.Search;

            OrdinalPaginatedList<MunicipalityDto> paginatedData;


            var municipalities =  _context.Municipalities
              .Include(i => i.Canton)
              .Include(i => i.StateEntity)
               .OrderBy(x => x.Name).AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                municipalities =  municipalities.Where(x => search.Contains(x.Name.ToLower().Trim()) || search.Contains(x.Canton.Name.ToLower().Trim()) || search.Contains(x.StateEntity.Name.ToLower().Trim())).AsQueryable();
            }

            if (request.IsFromExport)
            {
                var municipalitiesDtos = municipalities.ProjectToType<MunicipalityDto>().ToList();
                paginatedData = new OrdinalPaginatedList<MunicipalityDto>(municipalitiesDtos, municipalitiesDtos.Count, request.PageNumber, request.PageSize);
            }
            else
            {
                paginatedData = await municipalities.ProjectToType<MunicipalityDto>()
                .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
            }


            return paginatedData;
        }
    }
}

