using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Organizations.Notifications;

public abstract class
    UpdateOrganizationNotificationHandler<TContext> : INotificationHandler<UpdateOrganizationNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IAppDbContext _mainContext;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    public UpdateOrganizationNotificationHandler(TContext context,
        IAppDbContext mainContext,
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _context = context;
        _mainContext = mainContext;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(UpdateOrganizationNotification notification, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrEmpty(notification.SpecificHandlerOnly) &&
            notification.SpecificHandlerOnly != _handlerName)
            return;

        var isDatabaseAvailable = await _healthCheckService.IsDatabaseAvailable<TContext>();
        if (!isDatabaseAvailable)
        {
            await LogFailedSynchronization(notification, new Exception("Database is unavailable"),
                cancellationToken);
            return;
        }

        if (notification.OrganizationType != OrganizationTypeEnum.INSTITUTION)
        {
            return;
        }

        try
        {
            var mainOrganization = await _mainContext.Organizations
                .AsNoTrackingWithIdentityResolution()
                .FirstOrDefaultAsync(x => x.Id == notification.OrganizationId, cancellationToken);
            var organization = await _context.Organizations
                .AsNoTrackingWithIdentityResolution()
                .FirstOrDefaultAsync(x => x.Id == mainOrganization.Id, cancellationToken);

            if (organization != null)
            {
                organization.Name = mainOrganization.Name;
                organization.IdNumber = mainOrganization.IdNumber;
                organization.TaxNumber = mainOrganization.TaxNumber;
                organization.ResponsiblePersonFullName = mainOrganization.ResponsiblePersonFullName;
                organization.ResponsiblePersonFunction = mainOrganization.ResponsiblePersonFunction;
                organization.Address = mainOrganization.Address;
                organization.Place = mainOrganization.Place;
                organization.MunicipalityId = mainOrganization.MunicipalityId;
                organization.Email = mainOrganization.Email;
                organization.PhoneNumber = mainOrganization.PhoneNumber;
                organization.WebsiteUrl = mainOrganization.WebsiteUrl;
                organization.UpdatedAt = DateTime.Now;
                organization.UpdatedById = mainOrganization.UpdatedById;
                _context.Organizations.Update(organization);

                await _context.SaveChangesAsync(cancellationToken);
                await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(UpdateOrganizationNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.UPDATE,
            nameof(Organization), cancellationToken);
    }
}

public class BetaUpdateOrganizationNotificationHandler : UpdateOrganizationNotificationHandler<BetaDbContext>
{
    public BetaUpdateOrganizationNotificationHandler(BetaDbContext context, IAppDbContext mainContext,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, mainContext, databaseHealthCheckService, failureLoggingService,
            nameof(BetaUpdateOrganizationNotificationHandler))
    {
    }
}

public class GammaUpdateOrganizationNotificationHandler : UpdateOrganizationNotificationHandler<GammaDbContext>
{
    public GammaUpdateOrganizationNotificationHandler(GammaDbContext context, IAppDbContext mainContext,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, mainContext, databaseHealthCheckService, failureLoggingService,
            nameof(GammaUpdateOrganizationNotificationHandler))
    {
    }
}

public class DeltaUpdateOrganizationNotificationHandler : UpdateOrganizationNotificationHandler<DeltaDbContext>
{
    public DeltaUpdateOrganizationNotificationHandler(DeltaDbContext context, IAppDbContext mainContext,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, mainContext, databaseHealthCheckService, failureLoggingService,
            nameof(DeltaUpdateOrganizationNotificationHandler))
    {
    }
}