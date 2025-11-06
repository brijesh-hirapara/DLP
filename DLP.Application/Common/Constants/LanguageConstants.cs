using Microsoft.Extensions.Configuration;

namespace DLP.Application.Common.Constants;

public static class LanguageConstants
{
    public static Guid? DefaultLanguageId { get; private set; }
    public static string DefaultLanguage { get; private set; }

    public static void Initialize(IConfiguration configuration)
    {
        DefaultLanguageId = Guid.Parse(configuration["LanguageConstants:DefaultLanguageId"]);
        DefaultLanguage = configuration["LanguageConstants:LanguageCode"];
    }
}
