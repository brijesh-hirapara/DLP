using Microsoft.Extensions.Configuration;

namespace DLP.Application.Common.Constants;

public static class SystemConstants
{
    public static string SystemUserId { get; private set; }

    public static void Initialize(IConfiguration configuration)
    {
        SystemUserId = configuration["SystemConstants:SystemUserId"];
    }
}
