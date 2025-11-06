using DLP.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace DLP.Services;
public class DatabaseHealthCheck : IHealthCheck
{
    private readonly IAppDbContext _context;

    public DatabaseHealthCheck(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default(CancellationToken))
    {
        try
        {
            await _context.Database.ExecuteSqlRawAsync("SELECT 1;", cancellationToken: cancellationToken);
            return HealthCheckResult.Healthy();
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy(ex.Message);
        }
    }
}
