namespace DLP.Domain.Entities
{
    public class TransportGoods
    {
        public Guid Id { get; set; }
        public Guid TypeOfGoodsId { get; set; }
        public virtual Codebook TypeOfGoods { get; set; }
        public int Quantity { get; set; }
        public decimal Length { get; set; }
        public decimal Width { get; set; }
        public decimal Height { get; set; }
        public decimal Weight { get; set; }
        public bool IsIncludesAdrGoods { get; set; } 
        public bool IsCargoNotStackable { get; set; } 
        public Guid TransportRequestId { get; set; }
        public virtual TransportRequest TransportRequest { get; set; }
    }
}
