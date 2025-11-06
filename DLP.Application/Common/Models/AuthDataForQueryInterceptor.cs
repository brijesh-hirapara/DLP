using DLP.Domain.Enums;

namespace DLP.Application.Common.Models;

public class AuthDataForQueryInterceptor
{
    public Guid? OrganizationId { get; set; }
    public Guid? MunicipalityId { get; set; }
    public AccessLevelType AccessLevel { get; set; }
    public AuthDataForQueryInterceptor(Guid? organizationId, Guid municipalityId, AccessLevelType accessLevel)
    {
        OrganizationId = organizationId;
        MunicipalityId = municipalityId;
        AccessLevel = accessLevel;
    }
}
