using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Requests.Notifications;

public class CreateRequestNotificationHandler : INotificationHandler<CreateRequestNotification>
{
    private readonly IAppDbContext _mainContext;
    private readonly BetaDbContext _betaDbContext;
    private readonly GammaDbContext _gammaDbContext;
    private readonly DeltaDbContext _deltaDbContext;
    private readonly IEmailCommunicationService _emailCommunicationService;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    public CreateRequestNotificationHandler(IAppDbContext mainContext,
        BetaDbContext betaDbContext,
        GammaDbContext gammaDbContext,
        DeltaDbContext deltaDbContext,
        IEmailCommunicationService emailCommunicationService,
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService)
    {
        _mainContext = mainContext;
        _betaDbContext = betaDbContext;
        _gammaDbContext = gammaDbContext;
        _deltaDbContext = deltaDbContext;
        _handlerName = nameof(CreateRequestNotificationHandler);
        _emailCommunicationService = emailCommunicationService;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
    }

    public async Task Handle(CreateRequestNotification notification, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrEmpty(notification.SpecificHandlerOnly) &&
            notification.SpecificHandlerOnly != _handlerName)
            return;


        var request = notification.Request;
        var files = request.Attachments;
        request.Attachments.ToList().ForEach(x => x.FilePath = string.Empty);
        var stateEntityId = notification.StateEntityId;
        var isMinistryInstance = _mainContext.Database.IsMinistryDatabase();
        DbContextBase dbContextToUse;
        if (isMinistryInstance)
        {
            if (stateEntityId == EntityConstants.FBiH)
            {
                dbContextToUse = _betaDbContext;
            }
            else if (stateEntityId == EntityConstants.Srpska)
            {
                dbContextToUse = _gammaDbContext;
            }
            else
            {
                dbContextToUse = _deltaDbContext;
            }
        }
        else
        {
            // here we are at one of instances and from here we only need to target ministry db
            if (_betaDbContext.Database.IsMinistryDatabase())
            {
                dbContextToUse = _betaDbContext;
            }
            else if (_gammaDbContext.Database.IsMinistryDatabase())
            {
                dbContextToUse = _gammaDbContext;
            }
            else
            {
                dbContextToUse = _deltaDbContext;
            }
        }

        try
        {
            var isDatabaseAvailable = await _healthCheckService.IsDatabaseAvailable(dbContextToUse);
            if (!isDatabaseAvailable)
            {
                await LogFailedSynchronization(notification, dbContextToUse, new Exception("Database is unavailable"),
                    cancellationToken);
                return;
            }

            var otherDbRequest = request;
            otherDbRequest.CreatedById = SystemConstants.SystemUserId;
            await dbContextToUse.Requests.AddAsync(otherDbRequest, cancellationToken);
            await dbContextToUse.SaveChangesAsync(cancellationToken);
            await _emailCommunicationService.GetNewRequestAddedEmailInfo(dbContextToUse, request, cancellationToken);

            var fileSynchronizationTasks = files.Select(async (currentFileData, index) =>
            {
                var file = notification.Attachments[index];
                var filePath = file.FilePath;

                if (!File.Exists(filePath))
                {
                    return null;
                }

                var fileData = await File.ReadAllBytesAsync(filePath, cancellationToken);

                return new FileSynchronization
                {
                    FileName = file.FileName,
                    Data = fileData,
                    RelatedEntityId = currentFileData.RequestId,
                    Table = "RequestFiles",
                    Id = currentFileData.Id,
                };
            }).ToList();

            fileSynchronizationTasks = fileSynchronizationTasks.Where(task => task != null).ToList();
            var filesToSave = await Task.WhenAll(fileSynchronizationTasks);
            await dbContextToUse.FileSynchronizations.AddRangeAsync(filesToSave, cancellationToken);
            await dbContextToUse.SaveChangesAsync(cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            request.Attachments = null;
            await LogFailedSynchronization(notification, dbContextToUse, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(CreateRequestNotification notification, DbContext _context, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.ADD,
            nameof(Request), cancellationToken);
    }
}