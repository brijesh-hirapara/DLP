using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Codebooks.DTOs;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Application.Organizations.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;
using System.Xml.Linq;

namespace DLP.Application.Codebooks.Queries;

public class GetCodebooksByTypeQuery : IOrderingQuery<Codebook>, IRequest<OrdinalPaginatedList<CodebookDto>>
{
    private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

    private static readonly IReadOnlyDictionary<string, Expression<Func<Codebook, object?>>> OrderingPropertyMappings =
        new Dictionary<string, Expression<Func<Codebook, object?>>>(StringComparer)
        {
            { "name", x => x.Name },
            { "id", x => x.Id },
            { "createdAt", x => x.CreatedAt }
        };

    private static readonly OrderByFunction<Codebook> DefaultOrdering = new(x => x.CreatedAt, true);

    private static IReadOnlySet<string>? PropertyKeys { get; set; }
    public string Search { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string SortBy { get; set; } = "createdAt"; // Default sort by name
    public string SortType { get; set; } = "asc"; // Default sort in ascending order
    public CodebookTypeEnum Type { get; set; }
    public bool IsFromExport { get; set; } = false;

    //Sorting

    public SortingBy? Sorting { get; set; }
    public OrderByFunction<Codebook> GetDefaultOrdering() => DefaultOrdering;
    public IReadOnlyDictionary<string, Expression<Func<Codebook, object?>>> GetOrderingPropertyMappings() => OrderingPropertyMappings;
    public IReadOnlySet<string> GetPropertyKeys()
    {
        PropertyKeys ??= OrderingPropertyMappings.Keys.ToHashSet(StringComparer);
        return PropertyKeys;
    }
}

public class GetCodebooksByTypeQueryHandler : IRequestHandler<GetCodebooksByTypeQuery, OrdinalPaginatedList<CodebookDto>>
{
    private readonly IAppDbContext _dbContext;
    private readonly IActivityLogger _logger;
    private readonly ICurrentUserService _currentUserService;

    public GetCodebooksByTypeQueryHandler(IAppDbContext dbContext, IActivityLogger logger, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _logger = logger;
        _currentUserService = currentUserService;
    }

    public async Task<OrdinalPaginatedList<CodebookDto>> Handle(GetCodebooksByTypeQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var data = _dbContext.Codebooks
                .Where(c => c.Type == request.Type && !c.IsDeleted).AsQueryable();

            if (!string.IsNullOrEmpty(request.Search))
            {
                string search = request.Search.Replace(" ", "");
                data = data.Where(u => u.Name.Replace(" ", "").Contains(search));
            }

            OrdinalPaginatedList<CodebookDto> paginatedData;

            if (request.IsFromExport)
            {
                var oderedData = data.ApplyOrderByFunctions(request.GetOrderByFunction());
                var codebookDtos = oderedData.ProjectToType<CodebookDto>().ToList();
                paginatedData = new OrdinalPaginatedList<CodebookDto>(codebookDtos, codebookDtos.Count, request.PageNumber, request.PageSize);
            }
            else
            {
                paginatedData = await data.ApplyOrderByFunctions(request.GetOrderByFunction())
                .ProjectToType<CodebookDto>()
                .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
            }


            await _logger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved codebooks by type"
            });

            return paginatedData;
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to retrieve codebooks by type", _currentUserService.UserId);
            throw;
        }
    }
}
