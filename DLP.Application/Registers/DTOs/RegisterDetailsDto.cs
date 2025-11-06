using DLP.Application.Common.Extensions;
using DLP.Application.Qualifications.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;

namespace DLP.Application.Registers.DTOs;

public class RegisterDetailsDto
{
    public string? CompanyName { get; set; }
    public string? CompanyEmail { get; set; }
    public string? CompanyAddress { get; set; }
    public string? CompanyPlace { get; set; }
    public string? CompanyWebsite { get; set; }
    public string? CompanyPhoneNumber { get; set; }
    public string? CompanyIdNumber { get; set; }
    public string? CompanyTaxNumber { get; set; }
    public string? CompanyContactPerson { get; set; }
    public string? CompanyContactPersonEmail { get; set; }
    public DateTime CompanyEnrollmentDate { get; set; }
    public string? CompanyLicenseId { get; set; }
    public DateTime? CompanyLicenseDuration { get; set; }
    public string? CompanyMunicipality { get; set; }
    public string? CompanyCanton { get; set; }
    public string? CompanyEntity { get; set; }
    public bool IsOwnerAndOperator { get; set; }
    public bool IsKghService { get; set; }
    public bool IsImporterExporter { get; set; }
    public string? CompanyType { get; set; }
    public string? CompanyActivity { get; set; }
    public string CompanyStatusDesc { get; set; }
    public OrganizationStatus Status { get; set; }
    public List<BranchWithEquipmentsDetailsDto>? BranchesWithEquipments { get; set; }
    public List<CertificateNumberAvailabilityResult>? CertificationNumbers { get; set; }
    public RegisterDetailsDto(Organization organization)
    {
        CompanyName = organization.Name;
        CompanyEmail = organization.Email;
        CompanyAddress = organization.Address;
        CompanyPlace = organization.Place;
        CompanyWebsite = organization.WebsiteUrl;
        CompanyPhoneNumber = organization.PhoneNumber;
        CompanyIdNumber = organization.IdNumber;
        CompanyTaxNumber = organization.TaxNumber;
        CompanyContactPerson = organization.ContactPerson?.FullName;
        CompanyContactPersonEmail = organization.ContactPerson?.Email;
        CompanyMunicipality = organization.Municipality?.Name;
        CompanyCanton = organization.Municipality?.Canton?.Name;
        CompanyEntity = organization.Municipality?.StateEntity?.Name;
        CompanyEnrollmentDate = organization.CreatedAt;
        IsOwnerAndOperator = organization.CompanyRegisterTypes.Any(x => x.Type == Domain.Enums.CompanyType.OwnerAndOperator);
        IsKghService = organization.CompanyRegisterTypes.Any(x => x.Type == Domain.Enums.CompanyType.ServiceCompanyEnterpreneur);
        IsImporterExporter = organization.Type.IsOneOf(OrganizationTypeEnum.IMPORTER, OrganizationTypeEnum.EXPORTER, OrganizationTypeEnum.IMPORTER_EXPORTER) &&
                organization.CompanyRegisterTypes.Any(t => t.Type == Domain.Enums.CompanyType.ImporterExporter);
        CompanyType = organization.Type.GetRawDescription();
        CompanyLicenseId = organization.LicenseId;
        CompanyLicenseDuration = organization.LicenseDuration;
        CompanyActivity = organization.BusinessActivity?.Name;
        Status = organization.Status;
        CompanyStatusDesc = organization.Status.GetRawDescription();
    }

    // If you want to keep the mapping method for any reason:
    public static RegisterDetailsDto FromOrganization(Organization organization)
    {
        return new RegisterDetailsDto(organization);
    }
}
