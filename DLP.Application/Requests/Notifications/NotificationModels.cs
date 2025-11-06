using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Models;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace DLP.Application.Requests.Notifications;

public record CreateRequestNotification(Request Request, Guid StateEntityId, List<NotificationFileModel> Attachments) : IExtendableNotification
{
    public string? SpecificHandlerOnly { get; set; }
    public bool SyncSuccessful { get; set; }
    public string Signature => Request.Id.ToString();
}

public record ApproveRequestNotification(
    Guid RequestId,
    RequestType RequestType,
    string? RequestCertificationNumbers,
    Guid OrganizationId,
    string UserId,
    Guid? CompanyRegisterTypeId,
    Guid? CompanyBranchId,
    List<string>? UserGroups,
    bool CompanyNeedsToBeCreated) : IExtendableNotification
{
    public string? SpecificHandlerOnly { get; set; }
    public bool SyncSuccessful { get; set; }
    public string Signature => RequestId.ToString();
}

public record RejectRequestNotification(Request Request/*, Guid StateEntityId*/) : IExtendableNotification
{
    public string? SpecificHandlerOnly { get; set; }
    public bool SyncSuccessful { get; set; }
    public string Signature => Request.Id.ToString();
}
