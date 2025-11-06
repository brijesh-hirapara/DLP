using DLP.Application.Cantons.DTOs;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Municipalities.DTOs;
using Mapster;
using MediatR;

namespace DLP.Application.StateEntities.Queries
{
    public class GetAllStateEntitiesQuery : IRequest<OrdinalPaginatedList<StateEntityDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; }
        public string SortType { get; set; }
        public string Search { get; set; }
        public bool IsFromExport { get; set; } = false;
    }


    public class GetAllStateEntitiesQueryHandler : IRequestHandler<GetAllStateEntitiesQuery, OrdinalPaginatedList<StateEntityDto>>
    {
        private readonly IAppDbContext _context;

        public GetAllStateEntitiesQueryHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<OrdinalPaginatedList<StateEntityDto>> Handle(GetAllStateEntitiesQuery request, CancellationToken cancellationToken)
        {
            var search = request.Search;
            OrdinalPaginatedList<StateEntityDto> paginatedData;
         
            var entities = _context.StateEntities.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                entities = entities.Where(x=> search.Contains(x.Name.ToLower().Trim())).AsQueryable();
            }

            if (request.IsFromExport)
            {
                var entitiesDtos = entities.ProjectToType<StateEntityDto>().ToList();
                paginatedData = new OrdinalPaginatedList<StateEntityDto>(entitiesDtos, entitiesDtos.Count, request.PageNumber, request.PageSize);
            }
            else
            {
                paginatedData = await entities.ProjectToType<StateEntityDto>()
                .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
            }

            return paginatedData;
        }
    }
}

