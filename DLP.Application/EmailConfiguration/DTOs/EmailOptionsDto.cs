using DLP.Application.Common.Mappings;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.EmailConfiguration.DTOs
{
    public class EmailOptionsDto : IMapFrom<EmailOption>
    {
        public string From { get; set; }
        public string SmtpHost { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUser { get; set; }
        public string SmtpPass { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<EmailOption, EmailOptionsDto>();
        }
    }
}
