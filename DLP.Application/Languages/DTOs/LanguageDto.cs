using DLP.Application.Common.Mappings;
using DLP.Domain.Entities;
using Mapster;
using System.Linq;

namespace DLP.Application.Languages.DTOs
{
    public class LanguageDto : IMapFrom<Language>
    {
        public Guid Id { get; set; }
        public int Position { get; set; }
        public Guid I18nCodeId { get; set; }
        public I18nLanguageCodeDto I18nCode { get; set; }
        public bool HasTranslations { get; set;}
        public bool IsDefault { get; set;}

        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<Language, LanguageDto>()
                .Map(dest => dest.HasTranslations, src => src.Translations.Any());

            config.ForType<I18nLanguageCode, I18nLanguageCodeDto>();
        }
    }
}