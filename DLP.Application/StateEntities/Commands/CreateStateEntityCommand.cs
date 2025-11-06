using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using MediatR;

namespace DLP.Application.StateEntities.Commands
{
    public class CreateStateEntityCommand : IRequest<Unit>
    {
        public string Name { get; set; }
    }

    public class CreateStateEntityCommandHandler : IRequestHandler<CreateStateEntityCommand, Unit>
    {
        private readonly IAppDbContext _dbContext;

        public CreateStateEntityCommandHandler(IAppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Unit> Handle(CreateStateEntityCommand request, CancellationToken cancellationToken)
        {
            var stateEntity = new StateEntity { Name = request.Name };

            _dbContext.StateEntities.Add(stateEntity);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}