using System;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Models;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace DLP.Application.CertifiedTechnicians.Notifications;

public class AddCertifiedTechnicianNotification: IExtendableNotification
{
    public AddCertifiedTechnicianNotification(string userId, List<NotificationFileModel> files)
    {
        UserId = userId;
        Files = files;
    }

    public string UserId { get; set; }
    public List<NotificationFileModel> Files { get; set; }
    public string? SpecificHandlerOnly { get; set; }
    public string Signature => UserId;
}
public record EndEmploymentNotification(string UserId, DateTime EndDate) : IExtendableNotification
{
    public string? SpecificHandlerOnly { get; set; }
    public string Signature => UserId;}

public record StartEmploymentNotification(List<Employment> Employments) : IExtendableNotification
{
    public string? SpecificHandlerOnly { get; set; }
    public string Signature => string.Join(",", Employments.Select(x=> x.Id));
}

