namespace DLP.Domain.Entities;

public class Fallback
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Database { get; set; }
    public string Table { get; set; }
    public string Action { get; set; }
    public string JsonData { get; set; }
    public string NotificationHandlerModel { get; set; }
    public string Message { get; set; }
    public string Signature { get; set; }
    public DateTime? DateSucceeded { get; set; }
}

