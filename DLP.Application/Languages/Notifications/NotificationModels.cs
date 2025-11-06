using System;
using DLP.Application.Common.Interfaces;
using DLP.Application.Translations.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.Notifications.Notifications
{
    public record AddLanguageNotification(Language Language) : IExtendableNotification
    {
        public string? SpecificHandlerOnly { get; set; }
        public string Signature => Language.Id.ToString();
    }

    public record DeleteLanguageNotification(Guid Id) : IExtendableNotification
    {
        public string? SpecificHandlerOnly { get; set; }
        public string Signature => Id.ToString();
    }
}

