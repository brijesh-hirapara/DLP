using DLP.Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace DLP.Application.Hubs
{
    public class TransportHub : Hub
    {
        private readonly IAppDbContext _dbContext;

        public TransportHub(IAppDbContext dbContext)
        {
            _dbContext = dbContext;
        }


        //public async Task PlaceBid(Guid id, string price)
        //{
        //    await Clients.All.SendAsync("ReceiveBid", id, price);
        //}

        //public async Task NotifyAuctionStatusChange(Guid auctionId, string newStatus)
        //{
        //    await Clients.All.SendAsync("AuctionStatusChanged", auctionId, newStatus);
        //}

        public async Task NotifyTransportStatusChange(Guid requestId, string newStatus)
        {
            await Clients.All.SendAsync("TransportStatusChanged", requestId, newStatus);
        }

        //public async Task NotifyContractStatusChange(Guid offerId, string newStatus)
        //{
        //    await Clients.All.SendAsync("ContractStatusChanged", offerId, newStatus);
        //}
        //public async Task NotifyConsumerContractStatusChange(Guid offerId, string newStatus)
        //{
        //    await Clients.All.SendAsync("ConsumerContractStatusChanged", offerId, newStatus);
        //}
        //public async Task NotifyGuranteedPriceContractStatusChange(Guid offerId, string newStatus)
        //{
        //    await Clients.All.SendAsync("NotifyGuranteedPriceContractStatusChange", offerId, newStatus);
        //}
    }

}