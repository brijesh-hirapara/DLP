using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Languages.DTOs;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.Municipalities.DTOs
{

    public class StateEntityDto : IMapFrom<StateEntity>, IOrdinalNumber
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public int OrdinalNumber { get; set; }

        // Add other properties as needed

        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<StateEntity, StateEntityDto>();
        }
    }
}

