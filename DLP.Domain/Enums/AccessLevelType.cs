using System.ComponentModel;

namespace DLP.Domain.Enums;
public enum AccessLevelType
{
    [Description("Super Administrator")]
    SuperAdministrator = 7,
    //[Description("BIH Ozone Unit - MVTEO")]
    //CountryOfBiH = 6,
    //[Description("Federation of Bosnia and Hercegovia")]
    //EntityFBih = 5,
    //[Description("Republika Srpska")]
    //EntitySprska = 4,
    //[Description("Brcko District")]
    //EntityBrcko = 3,
    //[Description("Municipality")]

    //Municipality = 2,
    [Description("Company")]
    Company = 1,
    [Description("Basic")]
    Basic = 0
}
