namespace DLP.Application.EmailNotificationSender;

public class EmailNotification
{
    public Guid Uid { get; set; }
    public List<EmailInfo> Emails { get; set; } = new List<EmailInfo>();
}

public class EmailInfo
{
    public EmailType Type { get; set; }
    public object Data { get; set; }
}

public enum EmailType
{
    OneTimePassword,
    ForgotPassword,
    RequestSubmitted,
    CompanyApproved,
    CompanyRejected,
    UserToggleActivation,
    CodebookChange,
    RequestAdded,
    RequestApproved,
    RequestRejected,
    NotConfirmedPassowrd,
    RequestSubmittedVehicleFleet,
    RequestAddedVehicleFleet,
    RequestApprovedVehicleFleet,
    RequestRejectedVehicleFleet,
    CarrierUserFinancialYear,
    CarrierOfferEmail,
    AdminApprovalEmail,
    AdminRejectedEmail,
}
