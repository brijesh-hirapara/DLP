
using DLP.Application.Common.Mappings;
using DLP.Application.Languages.DTOs;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.Translations.DTOs
{
    public class TranslationDto : IMapFrom<Translation>
    {
        public string Key { get; set; }
        public string Value { get; set; }
        public Guid LanguageId { get; set; }
        public LanguageDto Language { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<Translation, TranslationDto>();
        }
    }
}
