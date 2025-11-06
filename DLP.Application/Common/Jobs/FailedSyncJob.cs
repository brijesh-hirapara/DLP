using DLP.Application.Cantons.NotificationHandlers;
using DLP.Application.CertifiedTechnicians.Notifications;
using DLP.Application.Codebooks.NotificationHandler;
using DLP.Application.Common.Interfaces;
using DLP.Application.CompanyBranches.NotificationHandlers;
using DLP.Application.CompanyBranches.Notifications;
using DLP.Application.Equipments.Notifications;
using DLP.Application.Handlers;
using DLP.Application.Languages.Notifications;
using DLP.Application.Municipalities.NotificationHandlers;
using DLP.Application.Organizations.Notifications;
using DLP.Application.Qualifications.Notifications;
using DLP.Application.Requests.Notifications;
using DLP.Application.Translations.Notifications;
using DLP.Application.Users.Notifications;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MoreLinq;
using Newtonsoft.Json;

namespace DLP.Application.Common.Jobs;

public interface IFailedSyncJob
{
    Task<int> RemainingRecordsToSync();
    Task Run();
}

public class FailedSyncJob : IFailedSyncJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IAppDbContext _mainContext;
    private readonly ILogger<FailedSyncJob> _logger;
    private const int BatchSize = 250;

    public FailedSyncJob(IServiceProvider serviceProvider, IAppDbContext mainContext, ILogger<FailedSyncJob> logger)
    {
        _serviceProvider = serviceProvider;
        _mainContext = mainContext;
        _logger = logger;
    }

    public async Task<int> RemainingRecordsToSync()
    {
        var count = await _mainContext.FailedSynchronizations
            .Where(x => !string.IsNullOrEmpty(x.NotificationHandlerModel) && !x.DateSucceeded.HasValue)
            .CountAsync();
        return count;
    }

    public async Task Run()
    {
        var failedEntries = await FetchFailedEntries();
        foreach (var batch in failedEntries.Batch(BatchSize)) // Using Batch extension method
        {
            foreach (var entry in batch)
            {
                try
                {
                    await ProcessEntry(entry);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        $"Failed to sync entry {JsonConvert.SerializeObject(entry)} due to following error {ex.InnerException?.Message ?? ex.Message}",
                        ex);
                }
            }
        }
    }

    private async Task<List<Fallback>> FetchFailedEntries()
    {
        return await _mainContext.FailedSynchronizations
            .Where(x => !string.IsNullOrEmpty(x.NotificationHandlerModel) && !x.DateSucceeded.HasValue)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync();
    }

    private async Task ProcessEntry(Fallback entry)
    {
        using var scope = _serviceProvider.CreateScope();
        var notification = DeserializeNotification(entry.NotificationHandlerModel, entry.JsonData);
        if (notification != null)
        {
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
            await mediator.Publish(notification);
        }
    }

    private object? DeserializeNotification(string identifier, string jsonData)
    {
        // Get the type from the identifier
        var type = GetTypeFromIdentifier(identifier);

        // Get all interfaces implemented by the handler
        var interfaces = type.GetInterfaces();

        // Find the INotificationHandler interface
        var notificationHandlerInterface = interfaces.FirstOrDefault(i =>
                                               i.IsGenericType && i.GetGenericTypeDefinition() ==
                                               typeof(INotificationHandler<>)) ??
                                           throw new InvalidOperationException(
                                               "INotificationHandler interface not found.");

        // Get the generic type arguments of INotificationHandler
        var genericArguments = notificationHandlerInterface.GetGenericArguments();

        // The first generic argument should be the notification type
        var notificationType = genericArguments[0];

        // Find the JsonConvert.DeserializeObject method
        var method = typeof(JsonConvert).GetMethods()
                         .FirstOrDefault(m => m.Name == "DeserializeObject" && m.IsGenericMethod &&
                                              m.GetGenericArguments().Length == 1 &&
                                              m.GetParameters().Length == 1 &&
                                              m.GetParameters()[0].ParameterType == typeof(string)) ??
                     throw new InvalidOperationException("Suitable JsonConvert.DeserializeObject method not found.");
        method = method.MakeGenericMethod(notificationType);
        var notificationObject = method.Invoke(null, new object[] { jsonData });
        // Deserialize the JSON data to the notification type
        if (notificationObject is IExtendableNotification notification)
        {
            // Set the SpecificHandlerOnly property
            notification.SpecificHandlerOnly = identifier;
            return notification;
        }
        else
        {
            // Handle the case where notificationObject does not implement IExtendableNotification
            // This could be logging, throwing an exception, etc., depending on your requirements
            _logger.LogError("Deserialized object does not implement IExtendableNotification.");
            return null;
        }
    }

    private static Type GetTypeFromIdentifier(string typeIdentifier)
    {
        // Map your type identifiers to actual types
        // Example:
        return typeIdentifier switch
        {
            "BetaActivateUserHandler" => typeof(BetaActivateUserHandler),
            "GammaActivateUserHandler" => typeof(GammaActivateUserHandler),
            "DeltaActivateUserHandler" => typeof(DeltaActivateUserHandler),
            "BetaAddCantonHandler" => typeof(BetaAddCantonHandler),
            "GammaAddCantonHandler" => typeof(GammaAddCantonHandler),
            "DeltaAddCantonHandler" => typeof(DeltaAddCantonHandler),
            "BetaUpdateCantonHandler" => typeof(BetaUpdateCantonHandler),
            "GammaUpdateCantonHandler" => typeof(GammaUpdateCantonHandler),
            "DeltaUpdateCantonHandler" => typeof(DeltaUpdateCantonHandler),
            "BetaDeleteCantonHandler" => typeof(BetaDeleteCantonHandler),
            "GammaDeleteCantonHandler" => typeof(GammaDeleteCantonHandler),
            "DeltaDeleteCantonHandler" => typeof(DeltaDeleteCantonHandler),
            "BetaAddCertifiedTechnicianHandler" => typeof(BetaAddCertifiedTechnicianHandler),
            "GammaAddCertifiedTechnicianHandler" => typeof(GammaAddCertifiedTechnicianHandler),
            "DeltaAddCertifiedTechnicianHandler" => typeof(DeltaAddCertifiedTechnicianHandler),
            "BetaEndEmploymentNotificationHandler" => typeof(BetaEndEmploymentNotificationHandler),
            "GammaEndEmploymentNotificationHandler" => typeof(GammaEndEmploymentNotificationHandler),
            "DeltaEndEmploymentNotificationHandler" => typeof(DeltaEndEmploymentNotificationHandler),
            "BetaStartEmploymentNotificationHandler" => typeof(BetaStartEmploymentNotificationHandler),
            "GammaStartEmploymentNotificationHandler" => typeof(GammaStartEmploymentNotificationHandler),
            "DeltaStartEmploymentNotificationHandler" => typeof(DeltaStartEmploymentNotificationHandler),
            "BetaAddCodebookHandler" => typeof(BetaAddCodebookHandler),
            "GammaAddCodebookHandler" => typeof(GammaAddCodebookHandler),
            "DeltaAddCodebookHandler" => typeof(DeltaAddCodebookHandler),
            "BetaUpdateCodebookHandler" => typeof(BetaUpdateCodebookHandler),
            "GammaUpdateCodebookHandler" => typeof(GammaUpdateCodebookHandler),
            "DeltaUpdateCodebookHandler" => typeof(DeltaUpdateCodebookHandler),
            "BetaAddLanguageHandler" => typeof(BetaAddLanguageHandler),
            "GammaAddLanguageHandler" => typeof(GammaAddLanguageHandler),
            "DeltaAddLanguageHandler" => typeof(DeltaAddLanguageHandler),
            "BetaDeleteLanguageHandler" => typeof(BetaDeleteLanguageHandler),
            "GammaDeleteLanguageHandler" => typeof(GammaDeleteLanguageHandler),
            "DeltaDeleteLanguageHandler" => typeof(DeltaDeleteLanguageHandler),
            "BetaAddMunicipalityHandler" => typeof(BetaAddMunicipalityHandler),
            "GammaAddMunicipalityHandler" => typeof(GammaAddMunicipalityHandler),
            "DeltaAddMunicipalityHandler" => typeof(DeltaAddMunicipalityHandler),
            "BetaUpdateMunicipalityNotificationHandler" => typeof(BetaUpdateMunicipalityNotificationHandler),
            "GammaUpdateMunicipalityNotificationHandler" => typeof(GammaUpdateMunicipalityNotificationHandler),
            "DeltaUpdateMunicipalityNotificationHandler" => typeof(DeltaUpdateMunicipalityNotificationHandler),
            "BetaDeleteMunicipalityHandler" => typeof(BetaDeleteMunicipalityHandler),
            "GammaDeleteMunicipalityHandler" => typeof(GammaDeleteMunicipalityHandler),
            "DeltaDeleteMunicipalityHandler" => typeof(DeltaDeleteMunicipalityHandler),
            "BetaAddOrganizationNotificationHandler" => typeof(BetaAddOrganizationNotificationHandler),
            "GammaAddOrganizationNotificationHandler" => typeof(GammaAddOrganizationNotificationHandler),
            "DeltaAddOrganizationNotificationHandler" => typeof(DeltaAddOrganizationNotificationHandler),
            "BetaUpdateOrganizationNotificationHandler" => typeof(BetaUpdateOrganizationNotificationHandler),
            "GammaUpdateOrganizationNotificationHandler" => typeof(GammaUpdateOrganizationNotificationHandler),
            "DeltaUpdateOrganizationNotificationHandler" => typeof(DeltaUpdateOrganizationNotificationHandler),
            "BetaDeleteOrganizationNotificationHandler" => typeof(BetaDeleteOrganizationNotificationHandler),
            "GammaDeleteOrganizationNotificationHandler" => typeof(GammaDeleteOrganizationNotificationHandler),
            "DeltaDeleteOrganizationNotificationHandler" => typeof(DeltaDeleteOrganizationNotificationHandler),
            "BetaChangeOrganizationStatusNotificationHandler" =>
                typeof(BetaChangeOrganizationStatusNotificationHandler),
            "GammaChangeOrganizationStatusNotificationHandler" =>
                typeof(GammaChangeOrganizationStatusNotificationHandler),
            "DeltaChangeOrganizationStatusNotificationHandler" =>
                typeof(DeltaChangeOrganizationStatusNotificationHandler),
            "BetaAddQualificationHandler" => typeof(BetaAddQualificationHandler),
            "GammaAddQualificationHandler" => typeof(GammaAddQualificationHandler),
            "DeltaAddQualificationHandler" => typeof(DeltaAddQualificationHandler),
            "BetaEditQualificationHandler" => typeof(BetaEditQualificationHandler),
            "GammaEditQualificationHandler" => typeof(GammaEditQualificationHandler),
            "DeltaEditQualificationHandler" => typeof(DeltaEditQualificationHandler),
            "BetaCreateRefrigerantTypeHandler" => typeof(BetaCreateRefrigerantTypeHandler),
            "GammaCreateRefrigerantTypeHandler" => typeof(GammaCreateRefrigerantTypeHandler),
            "DeltaCreateRefrigerantTypeHandler" => typeof(DeltaCreateRefrigerantTypeHandler),
            "UpdateRefrigerantTypeNotification" => typeof(BetaUpdateRefrigerantTypeHandler),
            "GammaUpdateRefrigerantTypeHandler" => typeof(GammaUpdateRefrigerantTypeHandler),
            "DeltaUpdateRefrigerantTypeHandler" => typeof(DeltaUpdateRefrigerantTypeHandler),
            "BetaApproveRequestHandler" => typeof(BetaApproveRequestHandler),
            "GammaApproveRequestHandler" => typeof(GammaApproveRequestHandler),
            "DeltaApproveRequestHandler" => typeof(DeltaApproveRequestHandler),
            "BetaCreateTranslationHandler" => typeof(BetaCreateTranslationHandler),
            "GammaCreateTranslationHandler" => typeof(GammaCreateTranslationHandler),
            "DeltaCreateTranslationHandler" => typeof(DeltaCreateTranslationHandler),
            "UpdateTranslationNotification" => typeof(BetaUpdateTranslationHandler),
            "GammaUpdateTranslationHandler" => typeof(GammaUpdateTranslationHandler),
            "DeltaUpdateTranslationHandler" => typeof(DeltaUpdateTranslationHandler),
            "CreateRequestNotificationHandler" => typeof(CreateRequestNotificationHandler),
            "BetaRejectRequestNotificationHandler" => typeof(BetaRejectRequestNotificationHandler),
            "GammaRejectRequestNotificationHandler" => typeof(GammaRejectRequestNotificationHandler),
            "DeltaRejectRequestNotificationHandler" => typeof(DeltaRejectRequestNotificationHandler),
            "BetaCompanyBranchCreatedHandler" => typeof(BetaCompanyBranchCreatedHandler),
            "GammaCompanyBranchCreatedHandler" => typeof(GammaCompanyBranchCreatedHandler),
            "DeltaCompanyBranchCreatedHandler" => typeof(DeltaCompanyBranchCreatedHandler),
            "BetaDeleteCompanyBranchHandler" => typeof(BetaDeleteCompanyBranchHandler),
            "GammaDeleteCompanyBranchHandler" => typeof(GammaDeleteCompanyBranchHandler),
            "DeltaDeleteCompanyBranchHandler" => typeof(DeltaDeleteCompanyBranchHandler),
            "BetaUpdateCompanyBranchHandler" => typeof(BetaUpdateCompanyBranchHandler),
            "GammaUpdateCompanyBranchHandler" => typeof(GammaUpdateCompanyBranchHandler),
            "DeltaUpdateCompanyBranchHandler" => typeof(DeltaUpdateCompanyBranchHandler),
            "BetaArchiveEquipmentHandler" => typeof(BetaArchiveEquipmentHandler),
            "GammaArchiveEquipmentHandler" => typeof(GammaArchiveEquipmentHandler),
            "DeltaArchiveEquipmentHandler" => typeof(DeltaArchiveEquipmentHandler),
            "BetaCreateEquipmentActivityHandler" => typeof(BetaCreateEquipmentActivityHandler),
            "GammaCreateEquipmentActivityHandler" => typeof(GammaCreateEquipmentActivityHandler),
            "DeltaCreateEquipmentActivityHandler" => typeof(DeltaCreateEquipmentActivityHandler),
            "BetaAddEquipmentHandler" => typeof(BetaAddEquipmentHandler),
            "GammaAddEquipmentHandler" => typeof(GammaAddEquipmentHandler),
            "DeltaAddEquipmentHandler" => typeof(DeltaAddEquipmentHandler),
            "BetaDeleteEquipmentHandler" => typeof(BetaDeleteEquipmentHandler),
            "GammaDeleteEquipmentHandler" => typeof(GammaDeleteEquipmentHandler),
            "DeltaDeleteEquipmentHandler" => typeof(DeltaDeleteEquipmentHandler),
            "BetaUpdateEquipmentHandler" => typeof(BetaUpdateEquipmentHandler),
            "GammaUpdateEquipmentHandler" => typeof(GammaUpdateEquipmentHandler),
            "DeltaUpdateEquipmentHandler" => typeof(DeltaUpdateEquipmentHandler),
            _ => throw new InvalidOperationException("Unknown type identifier."),
        };
    }
}