using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;

namespace DLP.Application.Municipalities.NotificationModels
{
    public class DeleteMunicipalityNotification : IExtendableNotification
    {
        public DeleteMunicipalityNotification(Guid id)
        {
            Id = id;
        }

        public Guid Id { get; set; }
        public string? SpecificHandlerOnly { get; set; }
        public string Signature => Id.ToString();
    }
    public class AddMunicipalityNotification : IExtendableNotification
    {
        public Municipality Municipality { get; private set; }
        public string? SpecificHandlerOnly { get; set; }
        public string Signature => Municipality.Id.ToString();

        // Overloaded constructor with Municipality parameter
        public AddMunicipalityNotification(Municipality municipality)
        {
            Municipality = municipality;
        }
    }

    public class UpdateMunicipalityNotification : IExtendableNotification
    {
        public Municipality Municipality { get; private set; }
        public string? SpecificHandlerOnly { get; set; }
        public string Signature => Municipality.Id.ToString();
        // Overloaded constructor with Municipality parameter
        public UpdateMunicipalityNotification(Municipality municipality)
        {
            Municipality = municipality;
        }
    }

}

