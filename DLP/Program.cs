using Autofac;
using Autofac.Extensions.DependencyInjection;
using Hangfire;
using Hangfire.MySql;
using DLP.Application;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Jobs;
using DLP.Application.Users.Commands;
using DLP.Filters;
using DLP.Infrastructure;
using DLP.Infrastructure.Middlewares;
using DLP.Pages;
using DLP.Services;
using MediatR.Extensions.Autofac.DependencyInjection;
using MediatR.Extensions.Autofac.DependencyInjection.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Logging;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using DLP.Infrastructure.Services;
using DLP;
using DLP.Application.Hubs;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// Register the CodePagesEncodingProvider
Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

builder.Services.AddLogging(o =>
{
    o.AddSeq(configuration.GetSection("Seq"));
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => { builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader(); });
});
//builder.Services.AddControllers()
//    .AddJsonOptions(options =>
//    {
//        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
//    });
builder.Services.AddApplicationLayer(configuration);
builder.Services.AddInfrastructureLayer(configuration);
builder.Services.AddBlobServices(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"));

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();
builder.Services.AddMemoryCache();

builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IFinancialYearJob, FinancialYearService>();
builder.Services.AddSingleton<ITemplateContentService, TemplateContentService>();
builder.Services.AddTransient<ITransportRequestService, TransportRequestService>();
builder.Services.AddRazorTemplating();

// builder.Services.AddResponseCompression(options => { options.Providers.Add<GzipCompressionProvider>(); options.EnableForHttps = true; options.MimeTypes = new[] { "application/json", "text/tab-separated-values", "application/javascript", "text/csv", "text" }; });

// Call UseServiceProviderFactory on the Host sub property 
builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());
builder.Host.ConfigureContainer<ContainerBuilder>(containerBuilder =>
{
    containerBuilder.RegisterMediatR(MediatRConfigurationBuilder
    .Create(typeof(CreateUserCommand).Assembly)
    .WithAllOpenGenericHandlerTypesRegistered()
    .WithRegistrationScope(RegistrationScope.Scoped) // currently only supported values are `Transient` and `Scoped`
    .Build());
});

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "DLP PROJECT API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please insert JWT with Bearer into field",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                        new string[] { }
                    }
                });
    c.SchemaFilter<SwaggerExcludeFilter>();
});
builder.Services.AddHangfire(config =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    int retries = 5;
    int delayMs = 5000;

    for (int i = 0; i < retries; i++)
    {
        try
        {
            config.UseStorage(new MySqlStorage(connectionString, new MySqlStorageOptions()));
            break; // success
        }
        catch (MySqlConnector.MySqlException ex)
        {
            Console.WriteLine($"[Hangfire] MySQL connection failed. Retry {i + 1}/{retries}. Error: {ex.Message}");
            Thread.Sleep(delayMs);
        }
    }
});
builder.Services.AddHangfireServer();

// Customise default API behaviour
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

builder.Services.Configure<FinancialYearJobSchedule>(
    builder.Configuration.GetSection("FinancialYearJobSchedule"));

// Build configuration
var environmentName = builder.Environment.EnvironmentName;

// Load configuration files
var configBuilder = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{environmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

builder.Services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("DatabaseCheck");

var app = builder.Build();

EntityConstants.Initialize(builder.Configuration);
LanguageConstants.Initialize(builder.Configuration);
SystemConstants.Initialize(builder.Configuration);
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint($"/swagger/v1/swagger.json", "Swagger");
});
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

//app.Use(async (ctx, next) =>
//{
//    //ctx.SetIdentityServerOrigin(configuration["JwtTokenOptions:Issuer"]);
//    ctx.RequestServices.GetRequiredService<IServerUrls>().Origin = "https://localhost:7111";
//    await next();
//});

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
    Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images")),
    RequestPath = "/images"
});

app.UseRouting();
app.UseCors("AllowAll");
app.UseMiddleware<ApiKeyMiddleware>();
app.UseMiddleware<BlacklistMiddleware>();
app.UseAuthentication();
app.UseIdentityServer();
app.UseHangfireDashboard("/mydashboard", options: new DashboardOptions
{
    Authorization = new[] { new HangfireDashboardNoAuthorizationFilter() }
});
app.UseAuthorization();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");
app.MapRazorPages();
app.UseEndpoints(endpoints =>
{
    endpoints.MapHub<TransportHub>("/transportHub");
});
app.UseHangfireServer();

//try
//{
//    app.UseHangfireDashboard("/hangfire", new DashboardOptions
//    {
//        Authorization = new[] { new HangfireDashboardNoAuthorizationFilter() }
//    });
//}
//catch (Exception ex)
//{
//    Console.WriteLine("⚠️ Hangfire Dashboard not available: " + ex.Message);
//}
app.MapFallbackToFile("index.html");
IdentityModelEventSource.ShowPII = true;



// Ensure this line is after 'app.Run()' and all other configurations
using var scope = app.Services.CreateScope();
var backgroundJobs = scope.ServiceProvider.GetRequiredService<IBackgroundJobClient>();

if (configuration.GetValue<bool>("ShouldRunSyncJob"))
{
    RecurringJob.AddOrUpdate<FailedSyncJob>("ProcessFailedSyncs",   
        job => scope.ServiceProvider.GetService<IFailedSyncJob>().Run(),
        configuration.GetValue<string>("SyncJobScheduleTime"),
        new RecurringJobOptions { TimeZone = TimeZoneInfo.Local, QueueName = "process_failed_syncs" });
}

var jobSettings = app.Services.GetService<IOptions<FinancialYearJobSchedule>>()?.Value;

if (jobSettings?.FinancialYear.ShouldRunSyncJob == true)
{
    var financialYearService = app.Services.GetService<IFinancialYearJob>();

    RecurringJob.AddOrUpdate(
        "SendFinancialYearEmail",
        () => financialYearService.SendFinancialYearEmail(),
     jobSettings.FinancialYear.SyncJobScheduleTime,
     TimeZoneInfo.FindSystemTimeZoneById("Central European Standard Time")
    );
}




app.MapGet("/env-check", () =>
{
    var env = app.Environment.EnvironmentName;
    return Results.Ok(new { environment = env });
}).AllowAnonymous();

app.Map("/health", appBuilder =>
{
    appBuilder.Run(async context =>
    {
        var healthCheckService = appBuilder.ApplicationServices
            .GetService<HealthCheckService>();

        var report = await healthCheckService.CheckHealthAsync();

        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(
            JsonSerializer.Serialize(report.Status == HealthStatus.Healthy));
    });
});
app.Run();


