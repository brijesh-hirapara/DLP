using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.Cantons.DTOs
{
    public class CantonDto : IMapFrom<Canton>, IOrdinalNumber
    {
        public required Guid Id { get; set; }
        public string Name { get; set; }
        public Guid StateEntityId { get; set; }
        public string EntityName { get; set; }
        public int OrdinalNumber { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<Canton, CantonDto>()
                .Map(dest => dest.EntityName, src => src.StateEntity != null ? src.StateEntity.Name : "");
        }
    }
}

