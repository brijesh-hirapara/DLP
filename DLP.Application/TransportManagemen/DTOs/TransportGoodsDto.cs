using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.TransportManagemen.DTOs
{
    public class TransportGoodsDto
    {
        public Guid? Id { get; set; }
        public Guid TypeOfGoodsId { get; set; }
        public int Quantity { get; set; }
        public decimal Length { get; set; }
        public decimal Width { get; set; }
        public decimal Height { get; set; }
        public decimal Weight { get; set; }
        public bool IsIncludesAdrGoods { get; set; }
        public bool IsCargoNotStackable { get; set; }
        public string? TypeOfGoodsName { get; set; }
        public void Mapping(TypeAdapterConfig config)
        {
            config.NewConfig<TransportGoods, TransportGoodsDto>()
                .Map(dest => dest.TypeOfGoodsName, src => src.TypeOfGoods != null ? src.TypeOfGoods.Name : null);
        }
    }
}
