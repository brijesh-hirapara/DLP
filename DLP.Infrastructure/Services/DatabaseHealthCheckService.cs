using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DLP.Infrastructure.Services;

public class DatabaseHealthCheckService : IDatabaseHealthCheckService
{
    private readonly IServiceProvider _serviceProvider;

    public DatabaseHealthCheckService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task<bool> IsDatabaseAvailable<TContext>() where TContext : DbContext
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<TContext>();
            return await context.Database.CanConnectAsync();
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> IsDatabaseAvailable<TContext>(TContext dbContextBase) where TContext : DbContextBase
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            return await dbContextBase.Database.CanConnectAsync();
        }
        catch
        {
            return false;
        }
    }
}