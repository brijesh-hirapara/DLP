namespace DLP.Domain.Enums;


/// <summary>
/// Represents the type of company an organization company can be.
/// Organization company can be of multiple types at the same time.
/// </summary>
public enum CompanyType
{
    Shipper = 1,
    Carrier = 2,
    OwnerAndOperator,
    ServiceCompanyEnterpreneur,
    ImporterExporter,
    CertifiedTechnicians,
}
