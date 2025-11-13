using DLP.Application.Common.Templates.Models;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;

namespace DLP.Application.Common.Interfaces;

public interface IEmailCommunicationService
{
    Task SendNotConfirmedUserEmail(string email, string oneTimePassword, CancellationToken cancellationToken);

    /// <summary>
    /// Sends an email containing a one-time password to the specified email address.
    /// </summary>
    /// <param name="email">The email address where the one-time password email will be sent.</param>
    /// <param name="oneTimePassword">The one-time password to be included in the email.</param>
    /// <param name="cancellationToken">A token to handle cancellation of the email sending task.</param>
    /// <returns>A Task representing the asynchronous operation of sending the one-time password email.</returns>
    Task SendOneTimePasswordEmail(string email, string oneTimePassword, CancellationToken cancellationToken);

    /// <summary>
    /// Sends an email containing a one-time password to the specified email address for the "Forgot Password" feature.
    /// </summary>
    /// <param name="email">The email address where the one-time password email will be sent.</param>
    /// <param name="cancellationToken">A token to handle cancellation of the email sending task.</param>
    /// <returns>A Task representing the asynchronous operation of sending the "Forgot Password" email.</returns>
    Task SendForgotPasswordEmail(string email, CancellationToken cancellationToken);

    /// <summary>
    /// Sends a confirmation email to the contact person and relevant users after a successful registration form submission.
    /// Users belonging to the BIH Ozone Unit - MVTEO user group, within the appropriate entity/district, are notified of a pending request
    /// that requires their action (approval/rejection).
    /// </summary>
    /// <param name="request">The submitted request</param>
    /// <returns>A Task representing the asynchronous operation of sending the confirmation emails.</returns>
    Task SendRequestSubmittedEmail(Request request, CancellationToken cancellationToken);
    Task GetNewRequestAddedEmailInfo(DbContextBase dbContext, Request request, CancellationToken cancellationToken);

    /// <summary>
    /// Sends an email to the specified company's email address to notify them that their fisrt application to be part of system has been approved.
    /// </summary>
    /// <param name="companyName">The name of the company to whom the approval email will be sent.</param>
    /// <param name="companyEmailAddress">The email address of the company to whom the approval email will be sent.</param>
    /// <param name="oneTimePassword">The one-time password to be included in the email.</param>
    /// <param name="cancellationToken">A token to handle cancellation of the email sending task.</param>
    /// <returns>A Task representing the asynchronous operation of sending the approval email.</returns>
    Task SendCompanyApprovedEmail(string companyName, string companyEmailAddress, string oneTimePassword, CancellationToken cancellationToken);

    /// <summary>
    /// Sends an email to the specified company's email address to notify them that their fisrt application to be part of system has been rejected.
    /// </summary>
    /// <param name="request">The request which is being rejected</param>
    /// <param name="cancellationToken">A token to handle cancellation of the email sending task.</param>
    /// <returns>A Task representing the asynchronous operation of sending the approval email.</returns>
    Task SendCompanyRejectedEmail(Request request, CancellationToken cancellationToken);

    /// <summary>
    /// Sends an email to the specified company's email address to notify them that their request has been approved.
    /// </summary>
    /// <param name="request">The request which is being rejected</param>
    /// <param name="cancellationToken">A token to handle cancellation of the email sending task.</param>
    /// <returns>A Task representing the asynchronous operation of sending the approval email.</returns>
    Task SendRequestApprovedEmail(Request request, CancellationToken cancellationToken);

    /// <summary>
    /// Sends an email to the specified company's email address to notify them that their request has been rejected.
    /// </summary>
    /// <param name="request">The request which is being rejected</param>
    /// <param name="cancellationToken">A token to handle cancellation of the email sending task.</param>
    /// <returns>A Task representing the asynchronous operation of sending the approval email.</returns>
    Task SendRequestRejectedEmail(Request request, CancellationToken cancellationToken);

    /// <summary>
    /// Sends an email to the specified company's email address to notify them that their request or application has been rejected.
    /// </summary>
    /// <param name="companyEmailAddress">The email address of the company to whom the approval email will be sent.</param>
    /// <param name="cancellationToken">A token to handle cancellation of the email sending task.</param>
    /// <returns>A Task representing the asynchronous operation of sending the approval email.</returns>
    Task CodebookChangeNotification(CodebookChangeViewModel model, DbContextBase dbContext, CancellationToken cancellationToken);
    Task CodebookChangeNotification(CodebookChangeViewModel model, CancellationToken cancellationToken);

    Task SendUserToggleActivationEmail(string email, Guid languageId, bool isActivated, CancellationToken cancellationToken);

    Task SendVehicleFleetRequestAdminEmail(RequestSubmittedVehicleFleetViewModel request, CancellationToken cancellationToken);

    Task SendVehicleFleetRequestApprovedEmail(RequestSubmittedVehicleFleetViewModel request, CancellationToken cancellationToken);

    Task SendVehicleFleetRequestRejectedEmail(RequestSubmittedVehicleFleetViewModel request, CancellationToken cancellationToken);

    Task SendCarrierUserFinancialYearEmail(List<CarrierUserDetailsViewModel> carrierUserList, CancellationToken cancellationToken);
    Task SendCarrierOfferEmail(List<CarrierOfferEmailViewModel> carrierOfferList, CancellationToken cancellationToken);
    Task SendAdminApprovalEmail(CarrierOfferResultEmailViewModel carrierOfferList, CancellationToken cancellationToken);
    Task SendAdminRejectedEmail(CarrierOfferResultEmailViewModel carrierOfferList, CancellationToken cancellationToken);
    Task SendSubmitedOfferToSuperAdminEmail(CarrierOfferResultEmailViewModel carrierOfferList, CancellationToken cancellationToken);
    Task SendPODConfirmationEmail(ShipperShipmentEmailViewModel shipperEmailDetail, CancellationToken cancellationToken);

}
