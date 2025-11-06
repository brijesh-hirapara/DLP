using System;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.Codebooks.NotificationModels
{
    public record UpdateCodebookNotification(Codebook Codebook, CodebookActionEnum Action) : IExtendableNotification
    {
        public string? SpecificHandlerOnly { get; set; }
        public string Signature => Codebook.Id.ToString();
    }

    public class AddCodebookNotification : IExtendableNotification {
        public AddCodebookNotification(Codebook codebook)
        {
            Codebook = codebook;
        }

        public Codebook Codebook { get; set; }
        public string? SpecificHandlerOnly { get; set; }
        public string Signature => Codebook.Id.ToString();
    }
}

