using DLP.Application.Common.Interfaces;
using DLP.Application.Municipalities.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Municipalities.Queries
{
    public class GetMunicipalityDetailQuery : IRequest<MunicipalityDto>
    {
        public Guid Id { get; set; }
    }

    public class GetMunicipalityDetailQueryHandler : IRequestHandler<GetMunicipalityDetailQuery, MunicipalityDto>
    {
        private readonly IAppDbContext _dbContext;

        public GetMunicipalityDetailQueryHandler(IAppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<MunicipalityDto> Handle(GetMunicipalityDetailQuery request, CancellationToken cancellationToken)
        {
            var municipality = await _dbContext.Municipalities
                .Include(m => m.Canton)
                .Include(m => m.StateEntity)
                .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken)
                ?? throw new Exception("Invalid Municipality");

            return municipality.Adapt<MunicipalityDto>();
        }
    }
}