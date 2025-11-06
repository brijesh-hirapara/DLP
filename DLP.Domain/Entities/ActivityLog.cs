namespace DLP.Domain.Entities;

public class ActivityLog
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public User User { get; set; }
    public string? IP { get; set; }
    public int LogType { get; set; }
    public string? Activity { get; set; }
    public string? Description { get; set; }
    public DateTime Date { get; set; }
}