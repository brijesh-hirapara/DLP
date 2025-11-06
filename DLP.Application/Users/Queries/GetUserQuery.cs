using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Users.DTO;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DLP.Application.Users.Queries;

public class GetUserQuery : IRequest<UserDto>
{
    public string UserId { get; set; }
}

public class GetUserQueryHandler : IRequestHandler<GetUserQuery, UserDto>
{
    private readonly IAppDbContext _db;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUserService;
    private readonly IConfiguration _configuration;


    public GetUserQueryHandler(IAppDbContext db, IActivityLogger activityLogger, ICurrentUserService currentUserService, IConfiguration configuration)
    {
        _db = db;
        _activityLogger = activityLogger;
        _currentUserService = currentUserService;
        _configuration = configuration;
    }

    public async Task<UserDto> Handle(GetUserQuery request, CancellationToken cancellationToken)
    {
        string errorMessage = string.Empty;

        try
        {
            var result = await _db.Users
                //.Include(x => x.Municipality)
                .Include(x => x.UserRoles)
                    .ThenInclude(x => x.Role)
                .Include(x => x.Organization)
                .FirstOrDefaultAsync(x => x.Id == request.UserId, cancellationToken: cancellationToken);

            if (result == null)
            {
                await _activityLogger.Exception("User not found", $"Failed to retrieve user with ID: {request.UserId}", _currentUserService.UserId);
                errorMessage = "User not found";
                throw new Exception(errorMessage);
            }

            var user = result.Adapt<UserDto>();
            var roles = result.UserRoles.Select(x => x.Role.Name);
            user.RoleName = string.Join(", ", roles);
            user.UserGroups = roles.ToList();
            user.OrganizationName = result.Organization?.Name;
            //user.CantonId = result.Municipality.CantonId;

            var APIsiteUrl = _configuration["APIUrl"];


            if (!string.IsNullOrEmpty(result.ProfileImage))
            {
                user.ProfileImage = $"{APIsiteUrl}/ProfileImages/{result.ProfileImage}";
            }

            if (!string.IsNullOrEmpty(result.BannerImage))
            {
                user.BannerImage = $"{APIsiteUrl}/BannerImages/{result.BannerImage}";
            }

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = $"Successfully retrieved user information for user with ID: {request.UserId}"
            });

            return user;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to retrieve user information", _currentUserService.UserId);
            throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
        }
    }
}
