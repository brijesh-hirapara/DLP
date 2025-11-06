using KGH.Application.Common.Interfaces;
using KGH.DbMigrator;
using KGH.Infrastructure.Persistence;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MySqlConnector;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// Get connection string from appsettings.json
var connectionString = configuration.GetConnectionString("DbConnection"); 
if (string.IsNullOrEmpty(connectionString))
{
    Console.Error.WriteLine("No connection string provided. Please set the DefaultConnection environment variable.");
    return;
}

try
{
    _ = new MySqlConnectionStringBuilder(connectionString);
}
catch (ArgumentException)
{
    Console.Error.WriteLine("The provided connection string is not valid.");
    return;
}

Console.WriteLine($"Connection string => {connectionString}");

builder.Services.AddDbContext<AppDbContext>(options =>
           options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 33))));
builder.Services.AddSingleton<ICurrentUserService, CurrentUserService>();

var app = builder.Build();

using var scope = app.Services.CreateScope();
var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

try
{
    var pendingMigrations = context.Database.GetPendingMigrations().ToList();

    if (pendingMigrations.Any())
    {
        Console.WriteLine("Pending migrations found. They will be applied:");
        foreach (var migration in pendingMigrations)
        {
            Console.WriteLine($" - {migration}");
        }

        await context.Database.MigrateAsync();
        Console.WriteLine("\nMigrations applied successfully.");
    }
    else
    {
        Console.WriteLine("No pending migrations found.");
    }
}
catch (Exception ex)
{
    Console.Error.WriteLine($"An error occurred while applying migrations: {ex.Message}");
}
finally
{
    app.StopAsync().GetAwaiter().GetResult();
}
