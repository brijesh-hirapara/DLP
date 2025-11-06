using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.ServiceTechnician.DTOs
{
    public class ServiceTechnicianReportDetailDto
    {
        public Guid Id { get; set; }
        public int Year { get; set; }
        public string ResponsiblePerson { get; set; }
        public DateTime SubmitedDate { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid UserId { get; set; }
        public List<ServiceTechnicianAnnualReportDto> ServiceTechnicianAnnualReport { get; set; }
        //public User User { get; set; }
        public Organization Organization { get; set; }
        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<ServiceTechnicianReport, ServiceTechnicianReportDetailDto>()
                .Map(dest => dest.Organization, src => src.Organization != null ? src.Organization.Name : "");
        }
    }
}
