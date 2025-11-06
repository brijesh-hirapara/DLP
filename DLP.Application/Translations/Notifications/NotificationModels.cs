using System;
using DLP.Application.Common.Interfaces;
using DLP.Application.Translations.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.Translations.Notifications
{
    public record AddTranslationNotification(Translation Translation) : IExtendableNotification
    {
        public string? SpecificHandlerOnly { get; set; }
        public string Signature => $"{Translation.Key}-{Translation.LanguageId}";
    }

    public record UpdateTranslationNotification(Translation Translation) : IExtendableNotification
    {
        public string? SpecificHandlerOnly { get; set; }
        public string Signature => $"{Translation.Key}-{Translation.LanguageId}";
    }
}

