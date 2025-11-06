using System.ComponentModel;

namespace DLP.Domain.Enums;

/// <summary>
/// Represents the type of requests related to KGH equipment.
/// </summary>
public enum RequestType
{
    [Description("Register as Shipper")]
    RegistraterAsShipper = 1,
    [Description("Register as Carrier")]
    RegistraterAsCarrier = 2,
    ///// <summary>
    ///// Request for registration of owners and operators of KGH equipment.
    ///// </summary>
    //[Description("Owners and Operators of KGH equipment.")]
    //RegistrationOfOwnersAndOperators,

    ///// <summary>
    ///// Request for registration and licensing of KGH service companies/entrepreneurs.
    ///// </summary>
    //[Description("KGH service companies/entrepreneurs")]
    //RegistrationAndLicensingOfServiceCompanies,

    ///// <summary>
    ///// Request for registration and licensing of importers/exporters of KGH equipment.
    ///// </summary>
    //[Description("Importers/Exporters of KGH equipment.")]
    //RegistrationAndLicensingOfImportersExporters,

    ///// <summary>
    ///// Request for extension of the license of KGH service companies/entrepreneurs.
    ///// </summary>
    //[Description("Extension of the license of KGH service companies/entrepreneurs.")]
    //RequestForExtensionOfLicenseOfServiceCompanies
}
