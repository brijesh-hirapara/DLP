using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Models;
using DLP.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace DLP.Application.Qualifications.Notifications
{
    public record EditQualificationNotification(Qualification Qualification, List<QualificationFile> NewFiles, List<NotificationFileModel> NewFilesBlob, string ToBeUpdatedCertificateNumber) : IExtendableNotification
    {
        public string? SpecificHandlerOnly { get; set; }
        public string Signature => Qualification.Id.ToString();
    }

    public record AddQualificationNotification(Qualification Qualification, List<NotificationFileModel> Files) : IExtendableNotification
    {
        public string? SpecificHandlerOnly { get; set; }
        public string Signature => Qualification.Id.ToString();
    }
}

