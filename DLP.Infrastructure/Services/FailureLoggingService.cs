using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using DLP.Application.Common.Extensions;
using Newtonsoft.Json;

namespace DLP.Infrastructure.Services;

public class FailureLoggingService : IFailureLoggingService
{
    private readonly IAppDbContext _dbContext;

    public FailureLoggingService(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task LogFailureAsync(IExtendableNotification notification, Exception ex, string handlerName,
        DbContext context, string action, string tableName, CancellationToken cancellationToken)
    {
        var data = JsonConvert.SerializeObject(notification, new JsonSerializerSettings
        {
            ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
            Formatting = Formatting.Indented
        });
        if (await _dbContext.FailedSynchronizations.AnyAsync(x => x.Signature == notification.Signature,
                cancellationToken)) return;

        await _dbContext.FailedSynchronizations.AddAsync(new Fallback
        {
            Id = Guid.NewGuid(),
            Signature = notification.Signature,
            JsonData = data,
            NotificationHandlerModel = handlerName,
            Database = context.Database.GetDatabaseKey(),
            Action = action,
            Table = tableName,
            Message = ex.InnerException?.Message ?? ex.Message
        }, cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }


    public async Task MarkSyncSuccessful(IExtendableNotification notification, CancellationToken cancellationToken)
    {
        var syncRecord =
            await _dbContext.FailedSynchronizations.FirstOrDefaultAsync(x => x.Signature == notification.Signature,
                cancellationToken);
        if (syncRecord != null)
        {
            syncRecord.DateSucceeded = DateTime.Now;
            syncRecord.Message = null;
            _dbContext.FailedSynchronizations.Update(syncRecord);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}