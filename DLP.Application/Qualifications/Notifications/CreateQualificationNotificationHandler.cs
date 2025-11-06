using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;

namespace DLP.Application.Qualifications.Notifications;

public abstract class
    CreateQualificationNotificationHandler<TContext> : INotificationHandler<AddQualificationNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    protected CreateQualificationNotificationHandler(TContext context,
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _context = context;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }


    public async Task Handle(AddQualificationNotification notification, CancellationToken cancellationToken)
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

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var qualification = notification.Qualification;

            notification.Qualification.QualificationFiles.ForEach(x => x.FilePath = string.Empty);

            qualification.CreatedById = SystemConstants.SystemUserId;

            qualification.CleanIncludes();
            qualification.HasPendingSyncFiles = notification.Files != null && notification.Files.Any();

            _context.Qualifications.Add(qualification);

            if (qualification.HasPendingSyncFiles)
            {
                var filePairs = qualification.QualificationFiles.Zip(notification.Files!,
                    (data, file) => new { data, file });

                foreach (var filePair in filePairs)
                {
                    var filePath = filePair.file.FilePath;
                    if (!File.Exists(filePath))
                    {
                        continue;
                    }
                    
                    var fileData = await File.ReadAllBytesAsync(filePath, cancellationToken);
                    await _context.FileSynchronizations.AddAsync(new FileSynchronization
                    {
                        FileName = filePair.file.FileName,
                        Data = fileData,
                        RelatedEntityId = filePair.data.QualificationId,
                        Id = filePair.data.Id,
                        Table = "QualificationFiles",
                    }, cancellationToken);
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);
            await _failureLoggingService.MarkSyncSuccessful(notification, cancellationToken);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            await LogFailedSynchronization(notification, ex, cancellationToken);
        }
    }

    private Task LogFailedSynchronization(AddQualificationNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.ADD,
            nameof(Qualification), cancellationToken);
    }
}

public class BetaAddQualificationHandler : CreateQualificationNotificationHandler<BetaDbContext>
{
    public BetaAddQualificationHandler(BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(BetaAddQualificationHandler))
    {
    }
}

public class GammaAddQualificationHandler : CreateQualificationNotificationHandler<GammaDbContext>
{
    public GammaAddQualificationHandler(GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(GammaAddQualificationHandler))
    {
    }
}

public class DeltaAddQualificationHandler : CreateQualificationNotificationHandler<DeltaDbContext>
{
    public DeltaAddQualificationHandler(DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(DeltaAddQualificationHandler))
    {
    }
}