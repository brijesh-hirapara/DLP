using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.Codebooks.DTOs
{
    public class CodebookDto : IMapFrom<Codebook>, IOrdinalNumber
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string InternalCode { get; set; }
        public int OrdinalNumber { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<Codebook, CodebookDto>();
        }
    }
}