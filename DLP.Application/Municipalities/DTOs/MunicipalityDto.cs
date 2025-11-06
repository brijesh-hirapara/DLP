using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Languages.DTOs;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.Municipalities.DTOs
{
    public class MunicipalityDto : IMapFrom<Municipality>, IOrdinalNumber
	{
        public required Guid Id { get; set; }
        public string Name { get; set; }
        public Guid? CantonId { get; set; } // Foreign key, nullable
        public string CantonName { get; set; }
        public Guid StateEntityId { get; set; } // Foreign key
        public string EntityName { get; set; }
        public int OrdinalNumber { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<Municipality, MunicipalityDto>()
                .Map(dest => dest.CantonName, src => src.Canton != null ? src.Canton.Name : "")
                .Map(dest => dest.EntityName, src => src.StateEntity != null ? src.StateEntity.Name : "");
        }
    }
}

