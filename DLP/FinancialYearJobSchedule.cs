namespace DLP
{
    public class FinancialYearJobSchedule
    {
        public FinancialYearSchedule FinancialYear { get; set; } = new();
    }

    public class FinancialYearSchedule
    {
        public bool ShouldRunSyncJob { get; set; }
        public string SyncJobScheduleTime { get; set; } = "0 0 1 4 *"; // Example cron
    }
}
