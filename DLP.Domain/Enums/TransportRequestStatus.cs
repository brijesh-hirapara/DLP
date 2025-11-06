using System.ComponentModel;

namespace DLP.Domain.Enums
{
    public enum TransportRequestStatus
    {
        [Description("Active")]
        Active = 1,
        [Description("Under Evaluation")]
        UnderEvaluation = 2,
        [Description("Completed")]
        Completed = 3,
        [Description("Cancelled")]
        Cancelled = 4,
    }

    public enum TransportCarrierStatus
    {
        [Description("Pending")]
        Pending = 1,
        [Description("Accepted")]
        Accepted = 2,
        [Description("Rejected")]
        Rejected = 3,
        [Description("Locked")]
        Locked = 4,
    }

    public enum TransportCarrierInvitationStatus
    {
        [Description("System Invited")]
        SystemInvited = 1,
        [Description("Manually Invited")]
        ManuallyInvited = 2,
    }
}
