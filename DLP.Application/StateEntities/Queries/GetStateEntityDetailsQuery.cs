using DLP.Application.Common.Interfaces;
using DLP.Application.Municipalities.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.StateEntities.Queries
{
    public class GetStateEntityDetailQuery : IRequest<StateEntityDto>
{
    public Guid Id { get; set; }
}

public class GetStateEntityDetailQueryHandler : IRequestHandler<GetStateEntityDetailQuery, StateEntityDto>
{
    private readonly IAppDbContext _dbContext;

    public GetStateEntityDetailQueryHandler(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<StateEntityDto> Handle(GetStateEntityDetailQuery request, CancellationToken cancellationToken)
    {
        var stateEntity = await _dbContext.StateEntities
            .Include(se => se.Cantons)
            .Include(se => se.Municipalities)
            .FirstOrDefaultAsync(se => se.Id == request.Id, cancellationToken)
            ?? throw new Exception("Invalid State Entity");

        return stateEntity.Adapt<StateEntityDto>();
    }
}
}