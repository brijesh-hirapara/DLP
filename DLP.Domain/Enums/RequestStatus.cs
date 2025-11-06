using System.ComponentModel;

namespace DLP.Domain.Enums;

public enum RequestStatus
{
    [Description("Pending")]
    Pending = 0,
    [Description("Approved")]
    Approved = 1,
    [Description("Rejected")]
    Rejected = 2,
}
