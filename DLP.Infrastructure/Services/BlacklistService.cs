using DLP.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace DLP.Infrastructure.Services;

public class BlacklistService : IBlacklistService
{
    private readonly IMemoryCache _cache;

    public BlacklistService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public void AddToBlacklist(params string[] emails)
    {
        foreach (var email in emails)
        {
            _cache.Set(email, true, TimeSpan.FromDays(30));
        }
    }

    public void RemoveFromBlacklist(params string[] emails)
    {
        foreach (var email in emails)
        {
            _cache.Remove(email);
        }
    }

    public bool IsBlacklisted(string email)
    {
        return _cache.TryGetValue(email, out _);
    }
}

