using DLP.Domain.Common;
using DLP.Domain.Enums;

namespace DLP.Domain.Entities;

public class Organization : SyncBase, IHasStateEntityId
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    /// <summary>
    /// Company Identification Number
    /// </summary>
    public string? IdNumber { get; set; }
    public string? TaxNumber { get; set; }
    public string? ResponsiblePersonFullName { get; set; }
    public string? ResponsiblePersonFunction { get; set; }
    public string? Address { get; set; }
    public string? Place { get; set; }
    public string? PostCode { get; set; }
    public Guid MunicipalityId { get; set; }
    public virtual Municipality Municipality { get; set; }
    public Guid StateEntityId { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? ContactPersonId { get; set; }
    public virtual User ContactPerson { get; set; }
    public OrganizationTypeEnum Type { get; set; }
    public string? LicenseId { get; set; }
    public DateTime? LicenseDuration { get; set; }
    public Guid? BusinessActivityId { get; set; }
    public virtual Codebook BusinessActivity { get; set; }
    public ICollection<User> Employees { get; set; }
    public ICollection<Request> Requests { get; set; }
    public virtual ICollection<Qualification> Qualifications { get; set; }
    public virtual ICollection<CompanyBranch> Branches { get; set; }
    public virtual ICollection<CompanyRegisterType> CompanyRegisterTypes { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; }
    public string? CreatedById { get; set; }
    public virtual User? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedById { get; set; }
    public virtual User? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }
    public OrganizationStatus Status { get; set; } = OrganizationStatus.Active;

    public Guid CountryId { get; set; }
}
