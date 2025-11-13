using System.ComponentModel;

namespace DLP.Domain.Enums
{
    public enum ShipmentsStatus
    {
        [Description("Active")]
        Active = 1,
        [Description("Completed")]
        Completed = 2
    }

    public enum ShipmentsCarrierStatus
    {
        [Description("Offer Booked")]
        OfferBooked = 1,
        [Description("Truck Assigned")]
        TruckAssigned = 2,
        [Description("Pickup Confirmed")]
        PickupConfirmed = 3,
        [Description("Delivery Confirmed")]
        DeliveryConfirmed = 4,
        [Description("POD Uploaded")]
        PODUploaded = 5,
        [Description("POD Confirmed")]
        PODConfirmed = 6,
    }
}
