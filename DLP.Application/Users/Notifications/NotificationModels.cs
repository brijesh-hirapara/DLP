using DLP.Application.Common.Interfaces;

namespace DLP.Application.Users.Notifications;

public record ActivateUserNotification(string UserId, string PasswordHash) : IExtendableNotification
{
    public string? SpecificHandlerOnly { get; set; }
    public string Signature => UserId;
}