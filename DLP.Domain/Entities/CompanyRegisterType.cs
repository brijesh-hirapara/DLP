using DLP.Domain.Enums;

namespace DLP.Domain.Entities;

public class CompanyRegisterType
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; }
    public CompanyType Type { get; set; }
}
