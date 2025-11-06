using DLP.Domain.Enums;

namespace DLP.Application.Organizations.Requests;

public class OrganizationRequest
{
    public string Name { get; set; }
    public string IdNumber { get; set; }
    public string TaxNumber { get; set; }
    public string ResponsiblePersonFullName { get; set; }
    public string ResponsiblePersonFunction { get; set; }
    public string Address { get; set; }
    public string Place { get; set; }
    public Guid MunicipalityId { get; set; }
    public Guid StateEntityId { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string WebsiteUrl { get; set; }
    public Guid? ContactPersonId { get; set; }
    public string ContactPersonFirstName { get; set; }
    public string ContactPersonLastName { get; set; }
    public string ContactPersonEmail { get; set; }
    public string? PostCode { get; set; }
    public Guid CountryId { get; set; }
    public OrganizationTypeEnum OrganizationType { get; set; } = OrganizationTypeEnum.INSTITUTION;
    public List<string> UserGroups { get; set; }
}
