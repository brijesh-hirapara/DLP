using DLP.Application.Common.Interfaces;
using MediatR;
using DLP.Application.VehicleFleetRequests.Commands;


namespace DLP.Infrastructure.Services
{
    public class FinancialYearService : IFinancialYearJob
    {

        private IMediator _mediator;
        private readonly HttpClient _httpClient;
        private readonly IAppDbContext _dbContext;

        public FinancialYearService(HttpClient httpClient, IAppDbContext dbContext, IMediator mediator)
        {
            _httpClient = httpClient;
            _dbContext = dbContext;
            _mediator = mediator;
        }
        public async Task SendFinancialYearEmail()
        {
            await _mediator.Send(new SendFinancialYearEmailToCarrierCommand { });
        }
    }
}
