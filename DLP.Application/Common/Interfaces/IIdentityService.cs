using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using System.Security.Claims;

namespace DLP.Application.Common.Interfaces;
public interface IIdentityService
{
    Task<User?> GetCurrentUser(string userId, bool includeDependecies = false);
    Task<string?> GetUserNameAsync(string userId);
    Task<bool> IsInRoleAsync(string userId, string role);
    Task<bool> AuthorizeAsync(string userId, string policyName);
    Task<bool> HasClaims(string userId, string[] claims);
    Task<Claim[]> BuildClaimsAsync(string userId);
    Task<List<string>> GetPermissionsAsync(string userId);
    Task<(Result Result, string UserId)> CreateUserAsync(string userName, string password);
    Task<Result> UpdateUserAsync(User user);
    Task<Result> DeleteUserAsync(string userId);
    Task<List<AccessLevelType>> GetRoleAccessLevelForClaim(string userId, params string[] claimTypes);
}