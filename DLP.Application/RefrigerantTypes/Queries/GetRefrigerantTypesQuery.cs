using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Common.Sorting;
using DLP.Application.RefrigerantTypes.DTO;
using DLP.Application.Users.DTO;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using System.Linq.Expressions;

namespace DLP.Application.RefrigerantTypes.Queries
{
    public class GetRefrigerantTypesQuery : IOrderingQuery<RefrigerantType>, IRequest<OrdinalPaginatedList<RefrigerantTypeDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string Search { get; set; }
        public bool IsFromExport { get; set; } = false;

        private static readonly StringComparer StringComparer = StringComparer.OrdinalIgnoreCase;

        private static readonly IReadOnlyDictionary<string, Expression<Func<RefrigerantType, object?>>> OrderingPropertyMappings =
            new Dictionary<string, Expression<Func<RefrigerantType, object?>>>(StringComparer)
            {
            { "name", x => x.Name },
            { "ashraeDesignation", x => x.ASHRAEDesignation },
            { "typeOfCoolingFluid", x => x.TypeOfCoolingFluid },
            { "globalWarmingPotential", x => x.GlobalWarmingPotential }
            };

        private static readonly OrderByFunction<RefrigerantType> DefaultOrdering = new(x => x.CreatedAt, true);

        private static IReadOnlySet<string>? PropertyKeys { get; set; }

        //Sorting

        public SortingBy? Sorting { get; set; }
        public OrderByFunction<RefrigerantType> GetDefaultOrdering() => DefaultOrdering;
        public IReadOnlyDictionary<string, Expression<Func<RefrigerantType, object?>>> GetOrderingPropertyMappings() => OrderingPropertyMappings;
        public IReadOnlySet<string> GetPropertyKeys()
        {
            PropertyKeys ??= OrderingPropertyMappings.Keys.ToHashSet(StringComparer);
            return PropertyKeys;
        }
    }

    public class GetRefrigerantTypesQueryHandler : IRequestHandler<GetRefrigerantTypesQuery, OrdinalPaginatedList<RefrigerantTypeDto>>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUserService;

        public GetRefrigerantTypesQueryHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _currentUserService = currentUserService;


        }

        public async Task<OrdinalPaginatedList<RefrigerantTypeDto>> Handle(GetRefrigerantTypesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var refrigerants = _context.RefrigerantTypes.Where(x=>!x.IsDeleted).AsQueryable();

                if (!string.IsNullOrEmpty(request.Search))
                {
                    string search = request.Search.ToLower();

                    refrigerants = refrigerants.Where(r =>
                        r.Name.ToLower().Contains(search) ||
                        r.ASHRAEDesignation != null && r.ASHRAEDesignation.ToLower().Contains(search) ||
                        r.TypeOfCoolingFluid != null && r.TypeOfCoolingFluid.ToLower().Contains(search) ||
                        r.GlobalWarmingPotential != null && r.GlobalWarmingPotential.ToLower().Contains(search)
                    );
                }

                OrdinalPaginatedList<RefrigerantTypeDto> paginatedData;

                if (request.IsFromExport)
                {
                    var ordereddata = refrigerants
                 .ApplyOrderByFunctions(request.GetOrderByFunction())
                 .ToList();

                    var refrigerantTypeDtos = ordereddata
                 .Select((r, index) => new RefrigerantTypeDto
                 {
                     Id = r.Id,
                     Name = r.Name,
                     ASHRAEDesignation = r.ASHRAEDesignation,
                     TypeOfCoolingFluid = r.TypeOfCoolingFluid,
                     GlobalWarmingPotential = r.GlobalWarmingPotential,
                     ChemicalFormula = r.ChemicalFormula
                 })
                 .ToList();

                    paginatedData = new OrdinalPaginatedList<RefrigerantTypeDto>(refrigerantTypeDtos, refrigerantTypeDtos.Count, request.PageNumber, request.PageSize);
                }
                else
                {
                    paginatedData = await refrigerants
                    .Where(x => !x.IsDeleted)
                    .ApplyOrderByFunctions(request.GetOrderByFunction())
                    .Select(r => new RefrigerantTypeDto
                    {
                        Id = r.Id,
                        Name = r.Name,
                        ASHRAEDesignation = r.ASHRAEDesignation,
                        TypeOfCoolingFluid = r.TypeOfCoolingFluid,
                        GlobalWarmingPotential = r.GlobalWarmingPotential,
                        ChemicalFormula = r.ChemicalFormula
                    })
                    .OrdinalPaginatedListAsync(request.PageNumber, request.PageSize);
                }

                    

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Successfully retrieved Refrigerant Types"
                });
                return paginatedData;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to retrieve Refrigerant Types");
                throw;
            }
        }
    }

}

