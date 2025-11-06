using DLP.Domain.Enums;

namespace DLP.Application.Registers.Queries
{
    public class GetRegistersForPublicQuery
    {
        public string Search { get; set; }
        public Guid? MunicipalityId { get; set; }
        public Guid? BusinessActivityId { get; set; }
        public int? CompanyType { get; set; }
        public Guid? EntityId { get; set; }
    }
}
