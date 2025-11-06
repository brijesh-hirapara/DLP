using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.ImportExportSubstances.DTOs
{
    public class ImportExportSubstancesReportDetailDto
    {
        public Guid Id { get; set; }
        public int Year { get; set; }
        public string ResponsiblePerson { get; set; }
        public DateTime SubmitedDate { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid UserId { get; set; }
        public List<ImportExportSubstancesAnnualReportDto> ImportExportSubstancesAnnualReport { get; set; }
        //public User User { get; set; }
        public Organization Organization { get; set; }
        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<ImportExportSubstancesReport, ImportExportSubstancesReportDetailDto>()
                .Map(dest => dest.Organization, src => src.Organization != null ? src.Organization.Name : "");
        }
    }
}
