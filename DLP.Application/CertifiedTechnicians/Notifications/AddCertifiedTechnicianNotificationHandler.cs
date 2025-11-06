using DLP.Application.CertifiedTechnicians.Notifications;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.OtherContexts;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Users.Notifications;

public abstract class
    AddCertifiedTechnicianNotificationHandler<TContext> : INotificationHandler<AddCertifiedTechnicianNotification>
    where TContext : DbContextBase
{
    private readonly IDatabaseHealthCheckService _healthCheckService;
    private readonly IFailureLoggingService _failureLoggingService;
    private readonly TContext _context;
    private readonly IAppDbContext _mainContext;
    private readonly string _handlerName;

    public AddCertifiedTechnicianNotificationHandler(
        IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService,
        TContext context,
        IAppDbContext mainContext,
        string handlerName)
    {
        _healthCheckService = healthCheckService;
        _failureLoggingService = failureLoggingService;
        _context = context;
        _mainContext = mainContext;
        _handlerName = handlerName;
    }

    public async Task Handle(AddCertifiedTechnicianNotification notification, CancellationToken cancellationToken)
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
            var dbUser = await _mainContext.Users
                            .Include(x => x.Qualifications)
                            .ThenInclude(x => x.QualificationFiles)
                            .Include(x => x.UserRoles)
                            .FirstOrDefaultAsync(x => x.Id == notification.UserId, cancellationToken) ??
                        throw new Exception("Technician in the target database doesn't exist!");

            var user = dbUser.DeepClone();
            user.CleanIncludes();

            user.CreatedById = SystemConstants.SystemUserId;
            user.Qualifications.ForEach(x => // it's going ot be only one at first time either way
            {
                x.CreatedById = SystemConstants.SystemUserId;
                x.HasPendingSyncFiles = notification.Files != null && notification.Files.Any();
            });

            _context.Users.Add(user);

            var qualificationFiles =
                user.Qualifications.FirstOrDefault()?.QualificationFiles; // it's going to be only one at first time

            if (qualificationFiles != null && qualificationFiles.Any())
            {
                var filePairs = qualificationFiles.Zip(notification.Files,
                    (currentFileData, file) => new { currentFileData, file });

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
                        RelatedEntityId = filePair.currentFileData.QualificationId,
                        Id = filePair.currentFileData.Id,
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

    private Task LogFailedSynchronization(AddCertifiedTechnicianNotification notification, Exception ex,
        CancellationToken cancellationToken)
    {
        return _failureLoggingService.LogFailureAsync(notification, ex, _handlerName, _context, DbActions.ADD,
            nameof(User), cancellationToken);
    }
}

public class BetaAddCertifiedTechnicianHandler : AddCertifiedTechnicianNotificationHandler<BetaDbContext>
{
    public BetaAddCertifiedTechnicianHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, BetaDbContext context, IAppDbContext mainContext)
        : base(healthCheckService, failureLoggingService, context, mainContext,
            nameof(BetaAddCertifiedTechnicianHandler))
    {
    }
}

public class GammaAddCertifiedTechnicianHandler : AddCertifiedTechnicianNotificationHandler<GammaDbContext>
{
    public GammaAddCertifiedTechnicianHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, GammaDbContext context, IAppDbContext mainContext)
        : base(healthCheckService, failureLoggingService, context, mainContext,
            nameof(GammaAddCertifiedTechnicianHandler))
    {
    }
}

public class DeltaAddCertifiedTechnicianHandler : AddCertifiedTechnicianNotificationHandler<DeltaDbContext>
{
    public DeltaAddCertifiedTechnicianHandler(IDatabaseHealthCheckService healthCheckService,
        IFailureLoggingService failureLoggingService, DeltaDbContext context, IAppDbContext mainContext)
        : base(healthCheckService, failureLoggingService, context, mainContext,
            nameof(DeltaAddCertifiedTechnicianHandler))
    {
    }
}