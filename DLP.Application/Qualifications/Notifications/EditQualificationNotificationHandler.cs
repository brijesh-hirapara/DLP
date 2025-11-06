using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Qualifications.Notifications;

public abstract class
    EditQualificationNotificationHandler<TContext> : INotificationHandler<EditQualificationNotification>
    where TContext : DbContextBase
{
    private readonly TContext _context;
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly string _handlerName;

    protected EditQualificationNotificationHandler(TContext context,
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        string handlerName)
    {
        _context = context;
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _handlerName = handlerName;
    }

    public async Task Handle(EditQualificationNotification notification, CancellationToken cancellationToken)
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
            var request = notification.Qualification;

            var qualification = await _context.Qualifications.AsNoTrackingWithIdentityResolution()
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);


            if (!string.IsNullOrEmpty(notification.ToBeUpdatedCertificateNumber))
                qualification.CertificateNumber = request.CertificateNumber;

            request.CleanIncludes();
            qualification.QualificationTypeId = request.QualificationTypeId;
            qualification.CertificateDuration = request.CertificateDuration;
            qualification.DateOfExam = request.DateOfExam;
            qualification.UpdatedAt = DateTime.UtcNow;
            qualification.CreatedById = SystemConstants.SystemUserId;
            qualification.UpdatedById = SystemConstants.SystemUserId;
            qualification.HasPendingSyncFiles = notification.NewFilesBlob.Any();

            _context.Qualifications.Update(qualification);

            var deletedFileIds = request.QualificationFiles.Where(x => x.IsDeleted).Select(z => z.Id);

            if (deletedFileIds.Any())
            {
                var toBeDeletedFileData =
                    _context.QualificationFiles.Where(x => deletedFileIds.Any(z => z == x.Id)).ToList();
                _context.QualificationFiles.RemoveRange(toBeDeletedFileData);
            }


            if (qualification.HasPendingSyncFiles)
            {
                var filePairs = notification.NewFiles.Zip(notification.NewFilesBlob,
                    (data, blob) => new { data, blob });

                foreach (var filePair in filePairs)
                {
                    var item = filePair.data;
                    var filePath = filePair.blob.FilePath;
                    if (!File.Exists(filePath))
                    {
                        continue;
                    }
                    
                    var fileData = await File.ReadAllBytesAsync(filePath, cancellationToken);
                    await _context.QualificationFiles.AddAsync(new QualificationFile
                    {
                        Id = item.Id,
                        IsDeleted = item.IsDeleted,
                        ContentType = item.ContentType,
                        FileName = item.FileName,
                        FilePath = string.Empty,
                        CreatedAt = item.CreatedAt,
                        QualificationId = item.QualificationId,
                        Size = item.Size,
                    }, cancellationToken);

                    await _context.FileSynchronizations.AddAsync(new FileSynchronization
                    {
                        FileName = item.FileName,
                        Data = fileData,
                        RelatedEntityId = item.QualificationId,
                        Id = item.Id,
                        Table = "QualificationFiles",
                    }, cancellationToken);
                }
            }

            var toBeUpdatedCertificateNumber = notification.ToBeUpdatedCertificateNumber;

            if (!string.IsNullOrEmpty(toBeUpdatedCertificateNumber))
            {
                _context.EquipmentActivities
                    .Where(x => x.TechnicianCertificateNumber == toBeUpdatedCertificateNumber)
                    .ExecuteUpdate(x =>
                        x.SetProperty(z => z.TechnicianCertificateNumber, toBeUpdatedCertificateNumber));

                _context.Requests
                    .Where(x => x.CertificationNumbers.Contains(toBeUpdatedCertificateNumber))
                    .ToList()
                    .ForEach(r => r.CertificationNumbers = r.CertificationNumbers
                        .Replace(toBeUpdatedCertificateNumber, notification.Qualification.CertificateNumber));
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

    private Task LogFailedSynchronization(EditQualificationNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.UPDATE,
            nameof(Qualification), cancellationToken);
    }
}

public class BetaEditQualificationHandler : EditQualificationNotificationHandler<BetaDbContext>
{
    public BetaEditQualificationHandler(BetaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(BetaEditQualificationHandler))
    {
    }
}

public class GammaEditQualificationHandler : EditQualificationNotificationHandler<GammaDbContext>
{
    public GammaEditQualificationHandler(GammaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(GammaEditQualificationHandler))
    {
    }
}

public class DeltaEditQualificationHandler : EditQualificationNotificationHandler<DeltaDbContext>
{
    public DeltaEditQualificationHandler(DeltaDbContext context,
        IDatabaseHealthCheckService databaseHealthCheckService, IFailureLoggingService failureLoggingService)
        : base(context, databaseHealthCheckService, failureLoggingService, nameof(DeltaEditQualificationHandler))
    {
    }
}