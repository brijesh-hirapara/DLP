using Microsoft.Extensions.Configuration;

namespace DLP.Application.Common.Constants;
public static class EntityConstants
{
    public static Guid Brcko { get; private set; }
    public static Guid Srpska { get; private set; }
    public static Guid FBiH { get; private set; }

    public static void Initialize(IConfiguration configuration)
    {
        Brcko = Guid.Parse(configuration["EntityConstants:Brcko"]);
        Srpska = Guid.Parse(configuration["EntityConstants:Srpska"]);
        FBiH = Guid.Parse(configuration["EntityConstants:FBiH"]);
    }
}


