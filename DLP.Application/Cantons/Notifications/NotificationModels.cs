using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;

namespace DLP.Application.Cantons.Notifications
{
    public class AddCantonNotification : IExtendableNotification
    {
        public Canton Canton { get; }

        public AddCantonNotification(Canton canton)
        {
            Canton = canton;
        }

        public string? SpecificHandlerOnly { get; set; }
        public string Signature => Canton.Id.ToString();
    }

    public class UpdateCantonNotification : IExtendableNotification
    {
        public Canton Canton { get; }

        public UpdateCantonNotification(Canton canton)
        {
            Canton = canton;
        }

        public string? SpecificHandlerOnly { get; set; }
        public string Signature => Canton.Id.ToString();
    }

    public class DeleteCantonNotification : IExtendableNotification
    {
        public Guid Id { get; }

        public DeleteCantonNotification(Guid id)
        {
            Id = id;
        }

        public string? SpecificHandlerOnly { get; set; }
        public string Signature => Id.ToString();
    }
}

