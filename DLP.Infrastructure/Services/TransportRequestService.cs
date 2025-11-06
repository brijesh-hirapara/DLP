using DLP.Application.Common.Interfaces;
using DLP.Application.TransportManagemen.Commands;
using DLP.Application.TransportManagemen.Jobs;
using MediatR;

namespace DLP.Infrastructure.Services
{
    public class TransportRequestService : ITransportRequestService
    {
        private readonly IMediator _mediator;
        public TransportRequestService(
            IMediator mediator
            )
        {
            _mediator = mediator;
        }

        public async Task ChangeTransportEvaluationStatus(string requestId, string startTime, string name)
        {
            await _mediator.Send(new ChangeTransportRequestStatusCommand { Id = requestId });
        }

        public async Task ChangeTransportCompletedOrRejected(string requestId, string startTime, string name)
        {
            await _mediator.Send(new ChangeTransportCompletedOrRejectedCommand { Id = requestId });
        }
    }
}
