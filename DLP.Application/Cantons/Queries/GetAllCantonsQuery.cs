using DLP.Application.Cantons.DTOs;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Municipalities.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Cantons.Queries;

public class GetAllCantonsQuery : IRequest<OrdinalPaginatedList<CantonDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string SortBy { get; set; }
    public string SortType { get; set; }
    public string Search { get; set; }
    public bool IsFromExport { get; set; } = false;
}


public class GetAllCantonsQueryHandler : IRequestHandler<GetAllCantonsQuery, OrdinalPaginatedList<CantonDto>>
{
    private readonly IAppDbContext _context;

    public GetAllCantonsQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<OrdinalPaginatedList<CantonDto>> Handle(GetAllCantonsQuery request, CancellationToken cancellationToken)
    {
        var search = request.Search;
        OrdinalPaginatedList<CantonDto> paginatedData;

        var cantons = _context.Cantons
        .Include(i => i.StateEntity).AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            cantons = cantons.Where(m => search.Contains(m.Name.ToLower().Trim()) || search.Contains(m.StateEntity.Name.ToLower().Trim())).AsQueryable();
        }


        if (request.IsFromExport)
        {
            var cantonsDtos = cantons.ProjectToType<CantonDto>().ToList();
            paginatedData = new OrdinalPaginatedList<CantonDto>(cantonsDtos, cantonsDtos.Count, request.PageNumber, request.PageSize);
        }
        else
        {
            paginatedData = await cantons.ProjectToType<CantonDto>()
            .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
        }

        return paginatedData;
    }
}