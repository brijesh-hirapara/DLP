using FluentValidation;
using Hangfire;
using Hangfire.MySql;
using DLP.Application.Common.Configurations;
using DLP.Application.Common.Jobs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using DLP.Application.Common.Interfaces;

namespace DLP.Application;

public static class ServiceExtensions
{
    
    public static void AddApplicationLayer(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMapster();
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        services.AddHangfire(config =>
            config.SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseDefaultTypeSerializer()
            .UseStorage(new MySqlStorage(configuration.GetConnectionString("DefaultConnection"), new MySqlStorageOptions { TablesPrefix = "Hangfire" }))); 
            services.AddHangfire(config => config.UseStorage(
    new MySqlStorage("server=dlp-mysql;database=kgh_ministry;user=root;password=Web@$123;", new MySqlStorageOptions())
));
        services.AddHangfireServer();
        if (configuration.GetValue<bool>("ShouldRunsyncJob"))
        {
            services.AddTransient<IFailedSyncJob, FailedSyncJob>();
        }

    }


    private static void UnobservedHandler(object sender, UnobservedTaskExceptionEventArgs args)
    {
        args.SetObserved();
    }
}
