using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.Organizations.Notifications;

public record AddOrganizationNotification(Guid OrganizationId, OrganizationTypeEnum OrganizationType, string UserId) : IExtendableNotification
{
    public string? SpecificHandlerOnly { get; set; }
    public string Signature => OrganizationId.ToString();
}

public record UpdateOrganizationNotification(Guid OrganizationId, OrganizationTypeEnum OrganizationType) : IExtendableNotification
{
    public string? SpecificHandlerOnly { get; set; }
    public string Signature => OrganizationId.ToString();
}

public record DeleteOrganizationNotification(Guid OrganizationId, OrganizationTypeEnum OrganizationType) : IExtendableNotification
{
    public string? SpecificHandlerOnly { get; set; }
    public string Signature => OrganizationId.ToString();
}

public record ChangeOrganizationStatusNotification(Guid OrganizationId, OrganizationTypeEnum OrganizationType) : IExtendableNotification
{
    public string? SpecificHandlerOnly { get; set; }
    public string Signature => OrganizationId.ToString();
}
