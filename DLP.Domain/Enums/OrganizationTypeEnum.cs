using System.ComponentModel;

namespace DLP.Domain.Enums;

public enum OrganizationTypeEnum
{
    [Description("Shipper")]
    SHIPPER = 1,
    [Description("Carrier")]
    CARRIER = 2,
    INSTITUTION,
    [Description("Company")]
    COMPANY,
    [Description("Entrepreneur")]
    ENTREPRENEUR,
    [Description("Importer")]
    IMPORTER ,
    [Description("Exporter")]
    EXPORTER ,
    [Description("Importer/Exporter")]
    IMPORTER_EXPORTER ,
}
