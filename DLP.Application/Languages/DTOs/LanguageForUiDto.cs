using DLP.Application.Common.Mappings;
using DLP.Domain.Entities;
using Mapster;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Languages.DTOs
{
    public class LanguageForUiDto : IMapFrom<Language>
    {
        public Guid Id { get; set; }
        public string Name { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<Language, LanguageForUiDto>()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Name, src => src.I18nCode.Name);
        }
    }
}
