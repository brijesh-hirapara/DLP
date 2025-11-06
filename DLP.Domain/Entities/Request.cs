using DLP.Domain.Enums;

namespace DLP.Domain.Entities;

public class Request
{
    public Guid Id { get; set; }
    /// <summary>
    /// Company Identification Number
    /// </summary>
    public required string IdNumber { get; set; }
    /// <summary>
    /// Auto-generated in format of YYYY-Number
    /// YYYY is current year
    /// Number is 4 random digits
    /// </summary>
    public required string RequestId { get; set; }
    public Guid? CompanyId { get; set; }
    public virtual Organization? Company { get; set; }
    public string? CompanyName { get; set; }
    public string? CompanyEmailAddress { get; set; }
    public string? CompanyPhoneNumber { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? TaxNumber { get; set; }
    public string? ResponsiblePersonFullName { get; set; }
    public string? ResponsiblePersonFunction { get; set; }
    public string? ContactPerson { get; set; }
    public string? ContactPersonEmail { get; set; }
    public string? Address { get; set; }
    public string? Place { get; set; }
    public string? PostCode { get; set; }
    public string? Comments { get; set; }
    //public string? FaxNumber { get; set; }
    public Guid MunicipalityId { get; set; }
    public virtual Municipality Municipality { get; set; }
    /// <summary>
    /// Auto-generated in format of XYZ-123
    /// </summary>
    public string? LicenseId { get; set; }
    public DateTime? LicenseDuration { get; set; }
    /// <summary>
    /// Holds one or more certification numbers of certified technicians. Numbers separated by semicolon (;)
    /// </summary>
    public string? CertificationNumbers { get; set; }
    public int? TotalNumberOfServiceTechnians { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the company meets the equipment regulations.
    /// </summary>
    public bool? MeetsEquipmentRegulations { get; set; }
    /// <summary>
    /// Tells whether request was made from public, if false, request was made from company within the system
    /// </summary>
    public bool IsFromPublic { get; set; }
    public Guid LanguageId { get; set; }
    public RequestType Type { get; set; }
    public RequestCompanyType? CompanyType { get; set; }
    public AreaOfExpertise? AreaOfExpertise { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.Pending;
    public Guid? BusinessActivityId { get; set; }
    public virtual Codebook BusinessActivity { get; set; }
    public ICollection<RequestFile> Attachments { get; set; } = new List<RequestFile>();
    public bool HasPendingSyncFiles { get; set; }


    // Audit
    public DateTime CreatedAt { get; set; }
    public string? CreatedById { get; set; }
    public virtual User? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedById { get; set; }
    public virtual User? UpdatedBy { get; set; }

    public string? ReviewedById { get; set; }
    public virtual User? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public bool IsDeleted { get; set; }
    public bool ReceiveNews { get; set; }
    public bool HasVatIdAndAcceptsTerms { get; set; }
    public Guid CountryId { get; set; }

}
