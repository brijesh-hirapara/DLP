using DLP.Application.Common.Interfaces;
using DLP.Application.Configurations;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using DLP.Infrastructure.Configurations;
using DLP.Infrastructure.Extensions;
using DLP.Infrastructure.Persistence;
using DLP.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace DLP.Infrastructure;

public static class ServiceExtensions
{
    public static void AddInfrastructureLayer(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtTokenOptions = configuration.GetSection("JwtTokenOptions").Get<JwtTokenOptions>();
        services.AddSingleton(jwtTokenOptions!);

        services.AddDbContext<AppDbContext>(options =>
            options.UseMySql(configuration.GetConnectionString("DefaultConnection"),
            new MySqlServerVersion(new Version(8, 0, 33))));

        services.AddDbContext<BetaDbContext>(options =>
           options.UseMySql(configuration.GetConnectionString("BetaConnection"),
           new MySqlServerVersion(new Version(8, 0, 33))));


        services.AddDbContext<GammaDbContext>(options =>
       options.UseMySql(configuration.GetConnectionString("GammaConnection"),
       new MySqlServerVersion(new Version(8, 0, 33))));

        services.AddDbContext<DeltaDbContext>(options =>
        options.UseMySql(configuration.GetConnectionString("DeltaConnection"),  
        new MySqlServerVersion(new Version(8, 0, 33))));

        services.AddSameSiteCookiePolicy();
        services.AddDefaultIdentity<User>(opt =>
        {
            opt.Password.RequireDigit = false;
            opt.Password.RequiredLength = 3;
            opt.Password.RequireNonAlphanumeric = false;
            opt.Password.RequireUppercase = false;
            opt.Password.RequireLowercase = false; 
        })
            .AddRoles<Role>()
            .AddEntityFrameworkStores<AppDbContext>();  

        services.AddTransient<IAppDbContext>(provider => provider.GetService<AppDbContext>()!);

        services.AddTransient<IBlacklistService, BlacklistService>();

        services.AddIdentityServer()
                .AddApiAuthorization<User, AppDbContext>()
                .AddProfileService<IdentityProfileService>();

        services.AddAuthentication(x =>
        {
            x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddIdentityServerJwt()
            .AddJwtBearer(options =>
            {
                options.Configuration = new OpenIdConnectConfiguration();
                options.Authority = jwtTokenOptions!.Issuer;
                options.Audience = jwtTokenOptions.Audience;
                options.RequireHttpsMetadata = true;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtTokenOptions.Issuer,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtTokenOptions.Secret)),
                    ValidAudience = jwtTokenOptions.Audience,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

        services.Configure<AppSettings>(configuration.GetSection("AppSettings"));

        services.AddTransient<IIdentityService, IdentityService>();
        services.AddTransient<IJwtAuthManager, JwtAuthManager>();
        services.AddTransient<IActivityLogger, ActivityLogger>();
        services.AddTransient<IEmailService, EmailService>();
        services.AddTransient<IEmailCommunicationService, EmailCommunicationService>();
        services.AddTransient<ITranslationService, TranslationService>();
        services.AddTransient<ILicenseIdGenerator, LicenseIdGenerator>();
        services.AddTransient<IDatabaseHealthCheckService, DatabaseHealthCheckService>();
        services.AddTransient<IFailureLoggingService, FailureLoggingService>();
        services.AddAuthorization();
        services.AddAuthorization(options =>
        {
            options.AddCustomPolicies();
        });
    }

    public static void AddBlobServices(this IServiceCollection services, string baseDir)
    {
        if (string.IsNullOrEmpty(baseDir))
        {
            throw new ArgumentNullException(nameof(baseDir));
        }
        services.AddSingleton<IBlobServiceFactory>(_ => new BlobServiceFactory(baseDir));
    }
}