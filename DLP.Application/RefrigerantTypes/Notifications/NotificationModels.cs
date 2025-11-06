using System;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.RefrigerantTypes.Notifications
{
    public record AddRefrigerantTypeNotification(RefrigerantType RefrigerantType) : IExtendableNotification
    {
        public string? SpecificHandlerOnly { get; set; }
        public string Signature => RefrigerantType.Id.ToString();
    }

    public record UpdateRefrigerantTypeNotification(RefrigerantType RefrigerantType, CodebookActionEnum Action) : IExtendableNotification
    {
        public string? SpecificHandlerOnly { get; set; }
        public string Signature => RefrigerantType.Id.ToString();
    }
}

