using System.ComponentModel;

namespace DLP.Domain.Enums;

/// <summary>
/// Represents the type of company coming from request
/// </summary>
public enum RequestCompanyType
{
    [Description("Company")]
    Company = 1,
    [Description("Entrepreneur")]
    Entrepreneur = 2,
    [Description("Importer")]
    Importer = 3,
    [Description("Exporter")]
    Exporter = 4,
    [Description("Importer/Exporter")]
    ImporterExporter = 5,
}
