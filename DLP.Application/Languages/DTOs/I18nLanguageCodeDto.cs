using DLP.Application.Common.Mappings;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.Languages.DTOs
{
    public class I18nLanguageCodeDto : IMapFrom<I18nLanguageCode>
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<I18nLanguageCode, I18nLanguageCodeDto>();
        }
    }
}