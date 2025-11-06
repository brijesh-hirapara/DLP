using System.ComponentModel;

namespace DLP.Domain.Enums
{
    public enum AccessibilityAvailable
    {
        [Description("Commercial with ramp but with lift")]
        CommercialWithRamp = 1,
        [Description("Commercial without ramp but with forklift")]
        CommercialWithoutRamp = 2,
        [Description("Commercial without forklift or ramp")]
        CommercialWithoutForklift = 3,
    }
}
