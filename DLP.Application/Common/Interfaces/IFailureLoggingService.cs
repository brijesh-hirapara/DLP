using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Common.Interfaces;

public interface IFailureLoggingService
{
    Task LogFailureAsync(IExtendableNotification notification, Exception ex, string handlerName, DbContext context,
        string action, string tableName, CancellationToken cancellationToken);

    Task MarkSyncSuccessful(IExtendableNotification notification, CancellationToken cancellationToken);
}