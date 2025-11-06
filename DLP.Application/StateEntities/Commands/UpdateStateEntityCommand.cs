using DLP.Application.Common.Interfaces;
using MediatR;

namespace DLP.Application.StateEntities.Commands
{
    public class UpdateStateEntityCommand : IRequest
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }

    public class UpdateStateEntityCommandHandler : IRequestHandler<UpdateStateEntityCommand>
    {
        private readonly IAppDbContext _dbContext;

        public UpdateStateEntityCommandHandler(IAppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task Handle(UpdateStateEntityCommand request, CancellationToken cancellationToken)
        {
            var stateEntity = await _dbContext.StateEntities.FindAsync(new object?[] { request.Id }, cancellationToken: cancellationToken) ?? throw new Exception("Invalid State Entity");

            stateEntity.Name = request.Name;

            _dbContext.StateEntities.Update(stateEntity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}