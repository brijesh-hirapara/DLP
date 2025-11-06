using System.ComponentModel;

namespace DLP.Domain.Enums;

public enum OrganizationStatus
{
    [Description("Active")]
    Active = 1,
    [Description("Suspended")]
    Suspended = 2
}