using DLP.Application.Common.Interfaces;
using MediatR;

namespace DLP.Application.StateEntities.Commands
{
    public class DeleteStateEntityCommand : IRequest
    {
        public Guid Id { get; set; }
    }

    public class DeleteStateEntityCommandHandler : IRequestHandler<DeleteStateEntityCommand>
    {
        private readonly IAppDbContext _dbContext;

        public DeleteStateEntityCommandHandler(IAppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task Handle(DeleteStateEntityCommand request, CancellationToken cancellationToken)
        {
            var stateEntity = await _dbContext.StateEntities.FindAsync(new object?[] { request.Id }, cancellationToken: cancellationToken) ?? throw new Exception("Invalid State Entity");

            _dbContext.StateEntities.Remove(stateEntity);
            await _dbContext.SaveChangesAsync(cancellationToken);

        }
    }
}
