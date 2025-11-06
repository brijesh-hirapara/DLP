using DLP.Domain.Enums;

public abstract class SyncBase
{
    public Guid? SyncToken { get; set; }
    public DateTime? LastSyncAt { get; set; }
    public string? ActionTakenBy { get; set; }

    public void BeforeLocalSync()
    {
        LastSyncAt = DateTime.UtcNow;
        SyncToken = Guid.NewGuid();
    }
}