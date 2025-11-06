using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DLP.Controllers;


[ApiController]
[Route("api/db-connection")]
public class DbConnectionHealthController : ApiControllerBase
{
    private readonly IAppDbContext _mainDbContext;
    private readonly BetaDbContext _betaDbContext;
    private readonly GammaDbContext _gammaDbContext;
    private readonly DeltaDbContext _deltaDbContext;
    private readonly IConfiguration _configuration;

    public DbConnectionHealthController(
        IAppDbContext mainDbContext,
        BetaDbContext betaDbContext,
        GammaDbContext gammaDbContext,
        DeltaDbContext deltaDbContext,
        IConfiguration configuration)
    {
        _mainDbContext = mainDbContext;
        _betaDbContext = betaDbContext;
        _gammaDbContext = gammaDbContext;
        _deltaDbContext = deltaDbContext;
        _configuration = configuration;
    }

    [HttpGet("{schema}")]
    public async Task<ActionResult<bool>> CheckHealth([FromRoute] string schema)
    {
        try
        {
            return await TestConnectionAsync(schema);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Error checking database health: " + ex.Message);
        }
    }

    private async Task<bool> TestConnectionAsync(string schema)
    {
        // Get all connection strings from the configuration
        var connectionStrings = _configuration.GetSection("ConnectionStrings").GetChildren();

        // Find the connection string that contains the specified schema
        var connectionString = connectionStrings.FirstOrDefault(cs => cs.Value.Contains($"database=kgh_{schema}"));

        if (connectionString == null)
            return false;

        // Match the found connection string with the correct DbContext
        if (connectionString.Key == "DefaultConnection")
        {
            try
            {
                await _mainDbContext.Database.OpenConnectionAsync();
                await _mainDbContext.Database.CloseConnectionAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }
        else if (connectionString.Key == "BetaConnection")
        {
            try
            {
                await _betaDbContext.Database.OpenConnectionAsync();
                await _betaDbContext.Database.CloseConnectionAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }
        else if (connectionString.Key == "GammaConnection")
        {
            try
            {
                await _gammaDbContext.Database.OpenConnectionAsync();
                await _gammaDbContext.Database.CloseConnectionAsync();
                return true;
            }
            catch
            {
                return false;
            }

        }
        else if (connectionString.Key == "DeltaConnection")
        {
            try
            {
                await _deltaDbContext.Database.OpenConnectionAsync();
                await _deltaDbContext.Database.CloseConnectionAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        return false;
    }

    private static async Task<bool> TestConnectionAsync(DbContext context)
    {
        try
        {
            await context.Database.OpenConnectionAsync();
            await context.Database.CloseConnectionAsync();
            return true;
        }
        catch
        {
            return false;
        }
    }
}