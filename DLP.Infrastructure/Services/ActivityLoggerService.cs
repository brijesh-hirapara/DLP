using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace DLP.Infrastructure.Services;

public class ActivityLogger : IActivityLogger
{
    private readonly IAppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ActivityLogger(IAppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    private string UserId => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
    private string IP => _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();

    public async Task Add(ActivityLogDto log)
    {
        var currentUserId = !string.IsNullOrEmpty(log.UserId) ? log.UserId : UserId;
        if (string.IsNullOrEmpty(currentUserId))
        {
            return;
        }

        var cancellationToken = new CancellationToken();
        await _context.ActivityLogs.AddAsync(new ActivityLog
        {
            UserId = currentUserId,
            IP = IP,
            LogType = log.LogTypeId,
            Activity = log.Activity,
            Description = log.Description,
            Date = DateTime.Now
        }, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task Add(List<ActivityLogDto> activities)
    {
        var activityLogs = activities.Select(log => new ActivityLog
        {
            UserId = UserId,
            IP = IP,
            LogType = log.LogTypeId,
            Activity = log.Activity,
            Description = log.Activity,
            Date = DateTime.Now
        }).Where(x => !string.IsNullOrEmpty(x.UserId));

        _context.ActivityLogs.AddRange(activityLogs);

        await _context.SaveChangesAsync(new CancellationToken());
    }

    public async Task Error(string error, string description = null, string userId = null) => await AddActivityLog(error, description, userId, LogTypeEnum.ERROR);
    public async Task Exception(string exception, string description = null, string userId = null) => await AddActivityLog(exception, description, userId, LogTypeEnum.EXCEPTION);

    public async Task Info(string info, string description = null, string userId = null) => await AddActivityLog(info, description, userId);

    protected async Task AddActivityLog(string activity, string description = null, string userId = null, LogTypeEnum activityType = LogTypeEnum.INFO)
    {
        var currentUserId = !string.IsNullOrEmpty(userId) ? userId : UserId;
        if (string.IsNullOrEmpty(currentUserId))
        {
            return;
        }

        await _context.ActivityLogs.AddAsync(new ActivityLog
        {
            UserId = !string.IsNullOrEmpty(userId) ? userId : UserId,
            IP = IP,
            LogType = (int)activityType,
            Activity = activity,
            Description = description,
            Date = DateTime.Now
        });

        await _context.SaveChangesAsync(new CancellationToken());
    }

}

