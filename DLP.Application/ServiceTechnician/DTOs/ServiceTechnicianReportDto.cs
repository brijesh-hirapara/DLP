using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Municipalities.DTOs;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.ServiceTechnician.DTOs
{
    public class ServiceTechnicianReportDto : IMapFrom<ServiceTechnicianReport>, IOrdinalNumber
    {
        public Guid Id { get; set; }
        public int Year { get; set; }
        public string ResponsiblePerson { get; set; }
        public DateTime? SubmitedDate { get; set; }
        public Guid OrganizationId { get; set; }
        public string OrganizationName { get; set; }
        public string UserName { get; set; }
        public int OrdinalNumber { get; set; }
        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<ServiceTechnicianReport, ServiceTechnicianReportDto>()
                .Map(dest => dest.OrganizationName, src => src.Organization != null ? src.Organization.Name : "")
                .Map(dest => dest.UserName, src => src.User != null ? src.User.FirstName : "");
        }
    }
}
