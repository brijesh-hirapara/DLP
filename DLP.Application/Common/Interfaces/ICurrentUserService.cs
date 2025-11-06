using DLP.Application.Common.Models;
using DLP.Domain.Enums;

namespace DLP.Application.Common.Interfaces;

public interface ICurrentUserService
{
    string UserId { get; }
    string UserName { get; }
    string UserRole { get; }
    Guid? OrganizationId { get; }
    Guid MunicipalityId { get; }
    AccessLevelType AccessLevel { get; }
    string LanguageCode { get; }
    List<string> UserRoleList { get; }
    AuthDataForQueryInterceptor GetDataForInterceptors();

}
