using Hangfire;
using DLP.Application.Common.Auth;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.EmailNotificationSender;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Web;
using DocumentFormat.OpenXml.Wordprocessing;
using DLP.Infrastructure.Migrations;

namespace DLP.Infrastructure.Services;

public class EmailCommunicationService : IEmailCommunicationService
{
    private readonly IAppDbContext _dbContext;
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly ITranslationService _translationService;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly ITemplateContentService _templateContentService;
    private readonly IBackgroundJobClient _backgroundJobClient;
    public EmailCommunicationService(
        IAppDbContext dbContext,
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
        ITranslationService translationService,
        IEmailService emailService,
        ITemplateContentService templateContentService,
        IBackgroundJobClient backgroundJobClient,
        IConfiguration configuration)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _roleManager = roleManager;
        _translationService = translationService;
        _configuration = configuration;
        _emailService = emailService;
        _templateContentService = templateContentService;
        _backgroundJobClient = backgroundJobClient;
    }

    public async Task SendNotConfirmedUserEmail(string email, string oneTimePassword, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(email) ?? throw new Exception($"User {email} not found");
        var languageCode = await GetLanguageCode(user.LanguageId, cancellationToken);
        EnqueueEmailNotification(new EmailNotification
        {
            Emails = new()
            {
                new EmailInfo
                {
                    Type = EmailType.NotConfirmedPassowrd,
                    Data = new NotConfirmedUserModal
                    {
                        RecipientEmail = user.Email!,
                        RecipientName = user.FullName,
                        OTPCode = oneTimePassword,
                        UserLang = languageCode,
                        SiteUrl = $"{_configuration["SiteUrl"]}/login"
                    }
                }
            }
        }, cancellationToken);
    }

    public async Task SendOneTimePasswordEmail(string email, string oneTimePassword, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(email) ?? throw new Exception($"User {email} not found");
        var languageCode = await GetLanguageCode(user.LanguageId, cancellationToken);
        EnqueueEmailNotification(new EmailNotification
        {
            Emails = new()
            {
                new EmailInfo
                {
                    Type = EmailType.OneTimePassword,
                    Data = new OTPViewModel
                    {
                        RecipientEmail = user.Email!,
                        RecipientName = user.FullName,
                        OTPCode = oneTimePassword,
                        UserLang = languageCode,
                        SiteUrl = $"{_configuration["SiteUrl"]}/login"
                    }
                }
            }
        }, cancellationToken);
    }

    public async Task SendForgotPasswordEmail(string email, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(email) ?? throw new Exception($"User {email} not found");
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var tokenUrl = $"{_configuration["SiteUrl"]}/reset-password?email={user.Email}&code={HttpUtility.UrlEncode(token)}";
        var languageCode = await GetLanguageCode(user.LanguageId, cancellationToken);

        EnqueueEmailNotification(new EmailNotification
        {
            Emails = new()
            {
                new EmailInfo
                {
                    Type = EmailType.ForgotPassword,
                    Data = new ForgotPasswordViewModel
                    {
                        Email = user.Email!,
                        UserLang = languageCode,
                        TokenUrl = tokenUrl,
                    }
                }
            }
        }, cancellationToken);
    }

    public async Task SendRequestSubmittedEmail(Request request, CancellationToken cancellationToken)
    {
        var languageCode = await GetLanguageCode(request.LanguageId, cancellationToken);
        var emailInfos = new EmailNotification
        {
            Emails = new()
            {
                new EmailInfo
                {
                    Type = EmailType.RequestSubmitted,
                    Data = new RequestSubmittedViewModel
                    {
                        RequestId = request.RequestId,
                        ContactPersonEmail = request.ContactPersonEmail!,
                        ContactName = request.ContactPerson,
                        UserLang = languageCode,
                    }
                }
            }
        };

        var requestAddedEmailInfo = GetNewRequestAddedEmailInfo(request.Id, request.RequestId, false);
        if (requestAddedEmailInfo != null)
        {
            emailInfos.Emails.Add(new EmailInfo
            {
                Type = EmailType.RequestAdded,
                Data = requestAddedEmailInfo
            });
        }
        EnqueueEmailNotification(emailInfos, cancellationToken);
    }

    public async Task SendCompanyApprovedEmail(string companyName, string companyEmailAddress, string oneTimePassword, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(companyEmailAddress)
            ?? throw new Exception($"User {companyEmailAddress} not found");

        var languageCode = await GetLanguageCode(user.LanguageId, cancellationToken);
        EnqueueEmailNotification(new EmailNotification
        {
            Emails = new()
            {
                new EmailInfo
                {
                    Type = EmailType.CompanyApproved,
                    Data = new CompanyApprovedViewModel
                    {
                        ContactPersonEmail = user.Email!,
                        ContactName = user.FullName,
                        CompanyName = companyName,
                        OTPCode = oneTimePassword,
                        SiteUrl = $"{_configuration["SiteUrl"]}",
                        UserLang = languageCode,
                    }
                }
            }
        }, cancellationToken);
    }

    public async Task SendCompanyRejectedEmail(Request request, CancellationToken cancellationToken)
    {
        var languageCode = await GetLanguageCode(request.LanguageId, cancellationToken);
        EnqueueEmailNotification(new EmailNotification
        {
            Emails = new()
            {
                new EmailInfo
                {
                    Type = EmailType.CompanyRejected,
                    Data = new CompanyRejectedViewModel
                    {
                        ContactPersonEmail = request.ContactPersonEmail,
                        ContactName = request.ContactPerson,
                        CompanyName = request.CompanyName,
                        UserLang = languageCode,
                    }
                }
            }
        }, cancellationToken);
    }

    public async Task SendUserToggleActivationEmail(string email, Guid languageId, bool isActivated, CancellationToken cancellationToken)
    {
        var languageCode = await GetLanguageCode(languageId, cancellationToken);
        EnqueueEmailNotification(new EmailNotification
        {
            Emails = new()
            {
                new EmailInfo
                {
                    Type = EmailType.UserToggleActivation,
                    Data = new ToggleUserActivationModel
                    {
                        Email = email,
                        IsActive = isActivated,
                        UserLang = languageCode,
                    }
                }
            }
        }, cancellationToken);
    }

    public async Task SendRequestApprovedEmail(Request request, CancellationToken cancellationToken)
    {
        var languageCode = await GetLanguageCode(request.LanguageId, cancellationToken);
        EnqueueEmailNotification(new EmailNotification
        {
            Emails = new()
            {
                new EmailInfo
                {
                    Type = EmailType.RequestApproved,
                    Data = new RequestApprovedViewModel
                    {
                        RequestId = request.RequestId,
                        ContactPersonEmail = request.ContactPersonEmail!,
                        ContactName = request.ContactPerson,
                        UserLang = languageCode,
                        RequestType = await _translationService.Translate(languageCode, $"request-{request.Type}-description",
                            request.Type.GetRawDescription())
                    }
                }
            }
        }, cancellationToken);
    }

    public async Task SendRequestRejectedEmail(Request request, CancellationToken cancellationToken)
    {
        var languageCode = await GetLanguageCode(request.LanguageId, cancellationToken);
        EnqueueEmailNotification(new EmailNotification
        {
            Emails = new()
            {
                new EmailInfo
                {
                    Type = EmailType.RequestRejected,
                    Data = new RequestRejectedViewModel
                    {
                        RequestId = request.RequestId,
                        ContactPersonEmail = request.ContactPersonEmail!,
                        ContactName = request.ContactPerson,
                        UserLang = languageCode,
                        RequestType = await _translationService.Translate(languageCode, $"request-{request.Type}-description",
                            request.Type.GetRawDescription()),
                        Reasons = request.Comments
                    }
                }
            }
        }, cancellationToken);
    }

    public async Task SendVehicleFleetRequestAdminEmail(RequestSubmittedVehicleFleetViewModel request, CancellationToken cancellationToken)
    {
        var emailInfos = new EmailNotification
        {
            Emails = new()
            {
                new EmailInfo
                {
                    Type = EmailType.RequestSubmittedVehicleFleet,
                    Data = new RequestSubmittedVehicleFleetViewModel
                    {
                        //RequestId = request.Id,
                        UserEmail = request.UserEmail,
                        UserName = request.UserName,
                        UserLang = request.UserLang,
                    }
                }
            }
        };

        var requestAddedEmailInfo = GetNewRequestAddedEmailInfo(request.Id, "", true);
        if (requestAddedEmailInfo != null)
        {
            emailInfos.Emails.Add(new EmailInfo
            {
                Type = EmailType.RequestAddedVehicleFleet,
                Data = requestAddedEmailInfo
            });
        }
        EnqueueEmailNotification(emailInfos, cancellationToken);
    }

    public async Task SendVehicleFleetRequestApprovedEmail(RequestSubmittedVehicleFleetViewModel request, CancellationToken cancellationToken)
    {
        EnqueueEmailNotification(new EmailNotification
        {
            Emails = new()
            {
                new EmailInfo
                {
                    Type = EmailType.RequestApprovedVehicleFleet,
                    Data = new RequestSubmittedVehicleFleetViewModel
                    {
                        RequestId = request.RequestId,
                        UserEmail = request.UserEmail!,
                        UserName = request.UserName,
                        UserLang = request.UserLang,
                    }
                }
            }
        }, cancellationToken);
    }

    public async Task SendVehicleFleetRequestRejectedEmail(RequestSubmittedVehicleFleetViewModel request, CancellationToken cancellationToken)
    {
        EnqueueEmailNotification(new EmailNotification
        {
            Emails = new()
            {
                new EmailInfo
                {
                    Type = EmailType.RequestRejectedVehicleFleet,
                    Data = new RequestSubmittedVehicleFleetViewModel
                    {
                        RequestId = request.RequestId,
                        UserEmail = request.UserEmail!,
                        UserName = request.UserName,
                        UserLang = request.UserLang,
                        Reasons = request.Reasons,
                    }
                }
            }
        }, cancellationToken);
    }

    public async Task SendCarrierUserFinancialYearEmail(List<CarrierUserDetailsViewModel> carrierUserList, CancellationToken cancellationToken)
    {
        if (carrierUserList == null || !carrierUserList.Any())
            return;


        foreach (var user in carrierUserList)
        {
            // Get the language code for the user
            var languageCode = await GetLanguageCode(new Guid(user.LanguageId), cancellationToken);

            // Prepare email info
            var emailInfos = new EmailNotification
            {
                Emails = new List<EmailInfo>
            {
                new EmailInfo
                {
                    Type = EmailType.CarrierUserFinancialYear,
                    Data = new CarrierUserDetailsViewModel
                    {
                        Email = user.Email,
                        FullName = user.FullName,
                        UserLang = languageCode,
                    }
                }
            }
            };

            EnqueueEmailNotification(emailInfos, cancellationToken);
        }


    }

    public async Task SendCarrierOfferEmail(List<CarrierOfferEmailViewModel> carrierOfferList, CancellationToken cancellationToken)
    {
        if (carrierOfferList == null || !carrierOfferList.Any())
            return;

        // Get the base client URL from config
        var clientBaseUrl = _configuration["SiteUrl"];

        foreach (var carrier in carrierOfferList)
        {
            var languageCode = await GetLanguageCode(new Guid(carrier.UserLang), cancellationToken);

            var emailNotification = new EmailNotification
            {
                Emails = new List<EmailInfo>
                {
                    new EmailInfo
                    {
                        Type = EmailType.CarrierOfferEmail,
                        Data = new CarrierOfferEmailViewModel
                        {
                            Email = carrier.Email,
                            FullName = carrier.FullName,
                            UserLang = languageCode,
                            RequestId = carrier.RequestId,
                            PickupCity = carrier.PickupCity,
                            DeliveryCity = carrier.DeliveryCity,
                            GoodsDescription = carrier.GoodsDescription,
                            Weight = carrier.Weight,
                            OfferDeadline = carrier.OfferDeadline,
                            Link = clientBaseUrl + carrier.Link
                        }
                    }
                }
            };

            EnqueueEmailNotification(emailNotification, cancellationToken);
        }
    }


    public async Task SendAdminApprovalEmail(CarrierOfferResultEmailViewModel carrierOffer, CancellationToken cancellationToken)
    {
        if (carrierOffer == null || string.IsNullOrEmpty(carrierOffer.Email))
            return;

        // Prepare email notification
        var emailNotification = new EmailNotification
        {
            Emails = new List<EmailInfo>
        {
            new EmailInfo
            {
                Type = EmailType.AdminApprovalEmail,
                Data = new CarrierOfferResultEmailViewModel
                {
                    Email = carrierOffer.Email,
                    FullName = carrierOffer.FullName,
                    UserLang = carrierOffer.UserLang,
                    RequestId = carrierOffer.RequestId,
                    EvaluationResult = carrierOffer.EvaluationResult
                }
            }
        }
        };

        // Queue background email job
        EnqueueEmailNotification(emailNotification, cancellationToken);
    }

    public async Task SendAdminRejectedEmail(CarrierOfferResultEmailViewModel carrierOffer, CancellationToken cancellationToken)
    {
        if (carrierOffer == null || string.IsNullOrEmpty(carrierOffer.Email))
            return;

        // Prepare email notification
        var emailNotification = new EmailNotification
        {
            Emails = new List<EmailInfo>
        {
            new EmailInfo
            {
                Type = EmailType.AdminRejectedEmail,
                Data = new CarrierOfferResultEmailViewModel
                {
                    Email = carrierOffer.Email,
                    FullName = carrierOffer.FullName,
                    UserLang = carrierOffer.UserLang,
                    RequestId = carrierOffer.RequestId,
                    EvaluationResult = carrierOffer.EvaluationResult
                }
            }
        }
        };

        // Queue background email job
        EnqueueEmailNotification(emailNotification, cancellationToken);
    }

    public async Task SendSubmitedOfferToSuperAdminEmail(CarrierOfferResultEmailViewModel carrierOffer, CancellationToken cancellationToken)
    {
        if (carrierOffer == null)
            return;

        // Get language for email localization
        var languageCode = await GetLanguageCode(LanguageConstants.DefaultLanguageId.Value, cancellationToken);
        carrierOffer.UserLang = languageCode;

        // Get SuperAdmin role IDs
        var superAdminRoleIds = await _dbContext.Roles
            .Where(r => r.NormalizedName == "SUPERADMIN" || r.Name == "Super Administrator")
            .Select(r => r.Id)
            .ToListAsync(cancellationToken);

        // Fetch all active and non-deleted SuperAdmins (get user info, not just emails)
        var superAdmins = await _dbContext.UserRoles
            .Include(ur => ur.User)
            .Where(ur => superAdminRoleIds.Contains(ur.RoleId)
                         && ur.User.IsActive
                         && !ur.User.IsDeleted)
            .Select(ur => new
            {
                ur.User.Email,
                ur.User.FullName
            })
            .Distinct()
            .ToListAsync(cancellationToken);

        if (superAdmins == null || !superAdmins.Any())
            return;

        // Prepare email notifications for each SuperAdmin
        var emailNotification = new EmailNotification
        {
            Emails = superAdmins.Select(user => new EmailInfo
            {
                Type = EmailType.SubmitedOfferToSendAdmin, // Change if using another type like SubmittedOffer
                Data = new CarrierOfferResultEmailViewModel
                {
                    Email = user.Email,
                    FullName = user.FullName ?? carrierOffer.FullName,
                    UserLang = carrierOffer.UserLang,
                    RequestId = carrierOffer.RequestId,
                    EvaluationResult = carrierOffer.EvaluationResult
                }
            }).ToList()
        };

        // Queue background email job
        EnqueueEmailNotification(emailNotification, cancellationToken);
    }

    public async Task SendPODConfirmationEmail(ShipperShipmentEmailViewModel shipperEmailDetail, CancellationToken cancellationToken)
    {
        if (shipperEmailDetail == null || string.IsNullOrEmpty(shipperEmailDetail.Email))
            return;

        // Prepare email notification
        var emailNotification = new EmailNotification
        {
            Emails = new List<EmailInfo>
        {
            new EmailInfo
            {
                Type = EmailType.PODConfirmation,
                Data = new ShipperShipmentEmailViewModel
                {
                    Email = shipperEmailDetail.Email,
                    FullName = shipperEmailDetail.FullName,
                    UserLang = shipperEmailDetail.UserLang,
                    RequestId = shipperEmailDetail.RequestId,
                    EvaluationResult = shipperEmailDetail.EvaluationResult
                }
            }
        }
        };

        // Queue background email job
        EnqueueEmailNotification(emailNotification, cancellationToken);
    }


    public async Task CodebookChangeNotification(CodebookChangeViewModel model, DbContextBase dbContext, CancellationToken cancellationToken)
    {
        try
        {
            var languageCode = await GetLanguageCode(LanguageConstants.DefaultLanguageId.Value, cancellationToken);
            model.UserLang = languageCode;

            var codbookClaims = new List<string>() {
            "type-of-equipment-modification",
            "type-of-equipments",
            "refrigeration-systems",
            "equipment-purposes",
            "municipalities",
            "cantons",
            "entities",
            "type-of-cooling-systems",
            "type-of-qualifications"
        };


            var rolesWithClaims = dbContext.Roles.Include(r => r.Claims).ToList();

            var matchingRoleIds = rolesWithClaims
                .Where(role => role.Claims.Any(claim => codbookClaims.Any(prefix => claim.ClaimValue.StartsWith(prefix))))
                .Select(role => role.Id)
                .ToList();

            var userEmails = dbContext.UserRoles
                .Include(userRole => userRole.User)
                .Where(userRole => matchingRoleIds.Contains(userRole.RoleId))
                .Select(userRole => userRole.User.Email).Distinct();

            string template = await _templateContentService.RenderToString("CodebookChangeNotification.cshtml", model);
            var subject = await _translationService.Translate(languageCode, "codebook:notification", "Codebook Notification!");

            await _emailService.SendEmailAsync(subject, template, cancellationToken, userEmails.ToArray());
        }
        catch (Exception ex)
        {
            throw;
        }
    }

    public async Task CodebookChangeNotification(CodebookChangeViewModel model, CancellationToken cancellationToken)
    {
        var languageCode = await GetLanguageCode(LanguageConstants.DefaultLanguageId.Value, cancellationToken);
        model.UserLang = languageCode;

        var codbookClaims = new List<string>() {
            "type-of-equipment-modification",
            "type-of-equipments",
            "refrigeration-systems",
            "equipment-purposes",
            "municipalities",
            "cantons",
            "entities",
            "type-of-cooling-systems",
            "type-of-qualifications"
        };


        var rolesWithClaims = _dbContext.Roles.Include(r => r.Claims).ToList();

        var matchingRoleIds = rolesWithClaims
            .Where(role => role.Claims.Any(claim => codbookClaims.Any(prefix => claim.ClaimValue.StartsWith(prefix))))
            .Select(role => role.Id)
            .ToList();

        var userEmails = _dbContext.UserRoles
            .Include(userRole => userRole.User)
            .Where(userRole => matchingRoleIds.Contains(userRole.RoleId))
            .Select(userRole => userRole.User.Email).Distinct();
        var activeUserEmails = _dbContext.Users
            .Where(u => u.IsActive && !u.IsDeleted && userEmails.Contains(u.Email)).Select(u => u.Email);

        model.RecipientEmails = activeUserEmails.ToArray();
        model.UserLang = languageCode;
        EnqueueEmailNotification(new EmailNotification
        {
            Emails = new()
            {
                new EmailInfo
                {
                    Type = EmailType.CodebookChange,
                    Data = model
                }
            }
        }, cancellationToken);
    }

    private NewRequestAddedViewModel GetNewRequestAddedEmailInfo(Guid id, string requestId, bool isVehicleFleet)
    {
        var approveRequestClaim = CustomPolicies.Requests.Approve.Name;

        var mvteoUsers = _roleManager.Roles
            .Where(r => r.Claims.Any(c => c.ClaimType == approveRequestClaim && c.ClaimValue == approveRequestClaim))
            .SelectMany(r => r.UserRoles.Select(ur => ur.User.Email))
            .ToArray();

        if (!mvteoUsers.Any())
        {
            return null;
        }

        return new NewRequestAddedViewModel
        {
            RequestId = requestId,
            RequestDetailsSiteUrl = isVehicleFleet ? $"{_configuration["SiteUrl"]}/vehicle-fleet/{id}" : $"{_configuration["SiteUrl"]}/requests/{id}",
            RecipientEmails = mvteoUsers!,
        };
    }

    public async Task GetNewRequestAddedEmailInfo(DbContextBase dbContext, Request request, CancellationToken cancellationToken)
    {
        var approveRequestClaim = CustomPolicies.Requests.Approve.Name;

        var mvteoUsers = _roleManager.Roles
            .Where(r => r.Claims.Any(c => c.ClaimType == approveRequestClaim && c.ClaimValue == approveRequestClaim))
            .SelectMany(r => r.UserRoles.Select(ur => ur.User.Email))
            .ToArray();

        if (!mvteoUsers.Any())
        {
            return;
        }

        var emailData = new NewRequestAddedViewModel
        {
            RequestDetailsSiteUrl = $"{_configuration["SiteUrl"]}/requests/{request.Id}",
            RecipientEmails = mvteoUsers!,
        };

        var languageCode = await GetLanguageCode(request.LanguageId, cancellationToken);
        var emailInfos = new EmailNotification
        {
            Emails = new()
            {
                new EmailInfo
                {
                    Type = EmailType.RequestAdded,
                    Data = emailData
                }
            }
        };
        EnqueueEmailNotification(emailInfos, cancellationToken);
    }


    private async Task<string> GetLanguageCode(Guid? userLanguageId, CancellationToken cancellationToken)
    {
        var languageCode = (await _dbContext.Languages
            .Include(x => x.I18nCode)
            .FirstOrDefaultAsync(x => x.Id == userLanguageId, cancellationToken))?.I18nCode?.Code
            ?? LanguageConstants.DefaultLanguage;
        return languageCode;
    }

    private void EnqueueEmailNotification(EmailNotification notification, CancellationToken cancellationToken)
    {
        var settings = new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.All };
        var notificationJson = JsonConvert.SerializeObject(notification, settings);
        _backgroundJobClient.Enqueue(() => SendEmail(notificationJson, cancellationToken));
    }

    public async Task SendEmail(string notificationJson, CancellationToken cancellationToken)
    {
        var settings = new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.Auto };
        var notification = JsonConvert.DeserializeObject<EmailNotification>(notificationJson, settings);
        if (notification == null)
        {
            return;
        }

        foreach (var emailInfo in notification.Emails)
        {
            switch (emailInfo.Type)
            {
                case EmailType.OneTimePassword:
                    var otpData = (OTPViewModel)emailInfo.Data;
                    string otpTemplate = await _templateContentService.RenderToString("OneTimePassword.cshtml", otpData);
                    var otpSubject = await _translationService.Translate(otpData.UserLang, "one-time-password:email.subject", "Welcome to MVP application");
                    await _emailService.SendEmailAsync(otpSubject, otpTemplate, cancellationToken, otpData.RecipientEmail);
                    break;

                case EmailType.NotConfirmedPassowrd:
                    var otpDataNotConfirmed = (NotConfirmedUserModal)emailInfo.Data;
                    string otpNotConfirmedTemplate = await _templateContentService.RenderToString("NotConfirmedUserEmail.cshtml", otpDataNotConfirmed);
                    var otpNotConfirmedSubject = await _translationService.Translate(otpDataNotConfirmed.UserLang, "one-time-password:email.subject", "Welcome to MVP application");
                    await _emailService.SendEmailAsync(otpNotConfirmedSubject, otpNotConfirmedTemplate, cancellationToken, otpDataNotConfirmed.RecipientEmail);
                    break;

                case EmailType.ForgotPassword:
                    var forgotPasswordData = (ForgotPasswordViewModel)emailInfo.Data;
                    string forgotPasswordTemplate = await _templateContentService.RenderToString("ForgotPassword.cshtml", forgotPasswordData);
                    var forgotPasswordSubject = await _translationService.Translate(forgotPasswordData.UserLang, "forgot-password:email.subject", "Reset Password");
                    await _emailService.SendEmailAsync(forgotPasswordSubject, forgotPasswordTemplate, cancellationToken, forgotPasswordData.Email);
                    break;

                case EmailType.RequestSubmitted:
                    var requestSubmittedData = (RequestSubmittedViewModel)emailInfo.Data;
                    string requestSubmittedTemplate = await _templateContentService.RenderToString("RequestSubmitted.cshtml", requestSubmittedData);
                    var requestSubmittedSubject = await _translationService.Translate(requestSubmittedData.UserLang, "request-submitted:email-subject", "Request {0} was initiated successfully");
                    await _emailService.SendEmailAsync(string.Format(requestSubmittedSubject, requestSubmittedData.RequestId), requestSubmittedTemplate, cancellationToken, requestSubmittedData.ContactPersonEmail);
                    break;

                case EmailType.CompanyApproved:
                    var companyApprovedData = (CompanyApprovedViewModel)emailInfo.Data;
                    string companyApprovedTemplate = await _templateContentService.RenderToString("CompanyApproved.cshtml", companyApprovedData);
                    var companyApprovedSubject = await _translationService.Translate(companyApprovedData.UserLang, "company-approved:email.subject", "Congrats, you have successfully become part of DLP system");
                    await _emailService.SendEmailAsync(companyApprovedSubject, companyApprovedTemplate, cancellationToken, companyApprovedData.ContactPersonEmail);
                    break;

                case EmailType.CompanyRejected:
                    var companyRejectedData = (CompanyRejectedViewModel)emailInfo.Data;
                    string companyRejectedTemplate = await _templateContentService.RenderToString("CompanyRejected.cshtml", companyRejectedData);
                    var companyRejectedSubject = await _translationService.Translate(companyRejectedData.UserLang, "company-rejected:email.subject", "Your request to become part of DLP system was rejected");
                    await _emailService.SendEmailAsync(companyRejectedSubject, companyRejectedTemplate, cancellationToken, companyRejectedData.ContactPersonEmail);
                    break;

                case EmailType.UserToggleActivation:
                    var userToggleActivationData = (ToggleUserActivationModel)emailInfo.Data;
                    string userToggleActivationTemplate = await _templateContentService.RenderToString("UserToggleActivation.cshtml", userToggleActivationData);
                    var userToggleActivationSubject = await _translationService.Translate(userToggleActivationData.UserLang, "user-toggle-activation:email.subject", "User Activation Status");
                    await _emailService.SendEmailAsync(userToggleActivationSubject, userToggleActivationTemplate, cancellationToken, userToggleActivationData.Email);
                    break;

                case EmailType.CodebookChange:
                    var codebookChangeData = (CodebookChangeViewModel)emailInfo.Data;
                    string codebookChangeTemplate = await _templateContentService.RenderToString("CodebookChangeNotification.cshtml", codebookChangeData);
                    var codebookChangeSubject = await _translationService.Translate(codebookChangeData.UserLang, "codebook:notification", "Codebook Notification!");
                    await _emailService.SendEmailAsync(codebookChangeSubject, codebookChangeTemplate, cancellationToken, codebookChangeData.RecipientEmails);
                    break;

                case EmailType.RequestAdded:
                    var requestAddedData = (NewRequestAddedViewModel)emailInfo.Data;
                    string requestAddedTemplate = await _templateContentService.RenderToString("NewRequestAdded.cshtml", requestAddedData);
                    var requestAddedSubject = await _translationService.Translate(LanguageConstants.DefaultLanguage,
                        "new-request-submitted:email-subject",
                        "New request {0} was created and its ready for review");
                    await _emailService.SendEmailAsync(string.Format(requestAddedSubject, requestAddedData.RequestId), requestAddedTemplate, cancellationToken, requestAddedData.RecipientEmails);
                    break;

                case EmailType.RequestApproved:
                    var requestApprovedData = (RequestApprovedViewModel)emailInfo.Data;
                    string requestApprovedTemplate = await _templateContentService.RenderToString("RequestApproved.cshtml", requestApprovedData);
                    var requestApprovedSubject = await _translationService.Translate(requestApprovedData.UserLang, "request-approved:email-subject", "Request {0} was approved successfully");
                    await _emailService.SendEmailAsync(string.Format(requestApprovedSubject, requestApprovedData.RequestId), requestApprovedTemplate, cancellationToken, requestApprovedData.ContactPersonEmail);
                    break;

                case EmailType.RequestRejected:
                    var requestRejectedData = (RequestRejectedViewModel)emailInfo.Data;
                    string requestRejectedTemplate = await _templateContentService.RenderToString("RequestRejected.cshtml", requestRejectedData);
                    var requestRejectedSubject = await _translationService.Translate(requestRejectedData.UserLang, "request-rejected:email-subject", "Request {0} was unfortunately rejected");
                    await _emailService.SendEmailAsync(string.Format(requestRejectedSubject, requestRejectedData.RequestId), requestRejectedTemplate, cancellationToken, requestRejectedData.ContactPersonEmail);
                    break;

                case EmailType.RequestSubmittedVehicleFleet:
                    var requestSubmittedVehicleFleetData = (RequestSubmittedVehicleFleetViewModel)emailInfo.Data;
                    string requestSubmittedVehicleFleetTemplate = await _templateContentService.RenderToString("RequestSubmittedVehicleFleet.cshtml", requestSubmittedVehicleFleetData);
                    var requestSubmittedVehicleFleetSubject = await _translationService.Translate(requestSubmittedVehicleFleetData.UserLang, "vehicle-fleet-request-submitted:email-subject", "Vehicle Fleet Request {0} was initiated successfully");
                    await _emailService.SendEmailAsync(string.Format(requestSubmittedVehicleFleetSubject, requestSubmittedVehicleFleetData.RequestId), requestSubmittedVehicleFleetTemplate, cancellationToken, requestSubmittedVehicleFleetData.UserEmail);
                    break;

                case EmailType.RequestAddedVehicleFleet:
                    var requestAddedVehicleFleetData = (NewRequestAddedViewModel)emailInfo.Data;
                    string requestAddedVehicleFleetTemplate = await _templateContentService.RenderToString("NewRequestAddedVehicleFleet.cshtml", requestAddedVehicleFleetData);
                    var requestAddedVehicleFleetSubject = await _translationService.Translate(LanguageConstants.DefaultLanguage,
                        "new-request-submitted-vehicle-fleet:email-subject",
                        "New vehicle fleet request {0} was created and its ready for review");
                    await _emailService.SendEmailAsync(string.Format(requestAddedVehicleFleetSubject, requestAddedVehicleFleetData.RequestId), requestAddedVehicleFleetTemplate, cancellationToken, requestAddedVehicleFleetData.RecipientEmails);
                    break;

                case EmailType.RequestApprovedVehicleFleet:
                    var requestApprovedVehicleFleetData = (RequestSubmittedVehicleFleetViewModel)emailInfo.Data;
                    string requestApprovedVehicleFleetTemplate = await _templateContentService.RenderToString("RequestApprovedVehicleFleet.cshtml", requestApprovedVehicleFleetData);
                    var requestApprovedVehicleFleetSubject = await _translationService.Translate(requestApprovedVehicleFleetData.UserLang, "request-approved-vehicle-fleet:email-subject", "Vehicle Fleet Request {0} was approved successfully");
                    await _emailService.SendEmailAsync(string.Format(requestApprovedVehicleFleetSubject, requestApprovedVehicleFleetData.RequestId), requestApprovedVehicleFleetTemplate, cancellationToken, requestApprovedVehicleFleetData.UserEmail);
                    break;

                case EmailType.RequestRejectedVehicleFleet:
                    var requestRejectedVehicleFleetData = (RequestSubmittedVehicleFleetViewModel)emailInfo.Data;
                    string requestRejectedVehicleFleetTemplate = await _templateContentService.RenderToString("RequestRejectedVehicleFleet.cshtml", requestRejectedVehicleFleetData);
                    var requestRejectedVehicleFleetSubject = await _translationService.Translate(requestRejectedVehicleFleetData.UserLang, "request-rejected-vehicle-fleet:email-subject", "Vehicle Fleet Request {0} was unfortunately rejected");
                    await _emailService.SendEmailAsync(string.Format(requestRejectedVehicleFleetSubject, requestRejectedVehicleFleetData.RequestId), requestRejectedVehicleFleetTemplate, cancellationToken, requestRejectedVehicleFleetData.UserEmail);
                    break;

                case EmailType.CarrierUserFinancialYear:
                    var requestFinancialYearData = (CarrierUserDetailsViewModel)emailInfo.Data;
                    string requestFinancialYearTemplate = await _templateContentService.RenderToString("CarrierUserFinancialYear.cshtml", requestFinancialYearData);
                    var requestFinancialYearSubject = await _translationService.Translate(requestFinancialYearData.UserLang, "carrier-user-fy:email-subject", "Financial Year Completed");
                    await _emailService.SendEmailAsync(string.Format(requestFinancialYearSubject, ""), requestFinancialYearTemplate, cancellationToken, requestFinancialYearData.Email);
                    break;

                case EmailType.CarrierOfferEmail:
                    var requestCarrierOfferData = (CarrierOfferEmailViewModel)emailInfo.Data;
                    string requestCarrierOfferTemplate = await _templateContentService.RenderToString("CarrierOfferInvite.cshtml", requestCarrierOfferData);
                    var requestCarrierOfferSubject = await _translationService.Translate(requestCarrierOfferData.UserLang, "carrier-offer:email-subject", "New Transport Request Available");
                    await _emailService.SendEmailAsync(string.Format(requestCarrierOfferSubject, ""), requestCarrierOfferTemplate, cancellationToken, requestCarrierOfferData.Email);
                    break;

                case EmailType.AdminApprovalEmail:
                    var requestCarrierOfferAdminApprovalData = (CarrierOfferResultEmailViewModel)emailInfo.Data;
                    string requestCarrierOfferAdminApprovalTemplate = await _templateContentService.RenderToString("CarrierOfferAdminApproval.cshtml", requestCarrierOfferAdminApprovalData);
                    var requestCarrierOfferAdminApprovalSubject = await _translationService.Translate(requestCarrierOfferAdminApprovalData.UserLang, "admin-approval:email-subject", "Your Offer Has Been Approved");
                    await _emailService.SendEmailAsync(string.Format(requestCarrierOfferAdminApprovalSubject, ""), requestCarrierOfferAdminApprovalTemplate, cancellationToken, requestCarrierOfferAdminApprovalData.Email);
                    break;
                case EmailType.AdminRejectedEmail:
                    var requestCarrierOfferAdminRejectedData = (CarrierOfferResultEmailViewModel)emailInfo.Data;
                    string requestCarrierOfferAdminRejectedTemplate = await _templateContentService.RenderToString("CarrierOfferAdminRejected.cshtml", requestCarrierOfferAdminRejectedData);
                    var requestCarrierOfferAdminRejectedSubject = await _translationService.Translate(requestCarrierOfferAdminRejectedData.UserLang, "admin-rejection-offer:email-subject", "Your Offer Was Not Selected");
                    await _emailService.SendEmailAsync(string.Format(requestCarrierOfferAdminRejectedSubject, ""), requestCarrierOfferAdminRejectedTemplate, cancellationToken, requestCarrierOfferAdminRejectedData.Email);
                    break;
                case EmailType.SubmitedOfferToSendAdmin:
                    var requestSubmitOfferData = (CarrierOfferResultEmailViewModel)emailInfo.Data;
                    string requestSubmitOfferTemplate = await _templateContentService.RenderToString("CarrierSubmitOfferToAdmin.cshtml", requestSubmitOfferData);
                    var requestSubmitOfferSubject = await _translationService.Translate(requestSubmitOfferData.UserLang, "carrier-submited-offer:email-subject", " Carrier Offer Submitted – Review Required");
                    await _emailService.SendEmailAsync(string.Format(requestSubmitOfferSubject, ""), requestSubmitOfferTemplate, cancellationToken, requestSubmitOfferData.Email);
                    break;
                case EmailType.PODConfirmation:
                    var podConfirmationData = (ShipperShipmentEmailViewModel)emailInfo.Data;
                    string podConfirmationTemplate = await _templateContentService.RenderToString("ShipperShipmentEmail.cshtml", podConfirmationData);
                    var podConfirmationSubject = await _translationService.Translate(podConfirmationData.UserLang, "shipper-shipment-pod-confirmed:email-subject", "Shipment POD Confirmed");
                    await _emailService.SendEmailAsync(string.Format(podConfirmationSubject, ""), podConfirmationTemplate, cancellationToken, podConfirmationData.Email);
                    break;

                default:
                    throw new InvalidOperationException($"Unhandled email type: {emailInfo.Type}");
            }
        }
    }
}
