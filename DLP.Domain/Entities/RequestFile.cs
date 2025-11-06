namespace DLP.Domain.Entities;

public class RequestFile
{
    public Guid Id { get; set; }
    public Guid RequestId { get; set; }
    public virtual Request Request { get; set; }
    public string FilePath { get; set; }
    public string FileName { get; set; }
    public long Size { get; set; } // In bytes.
    public string ContentType { get; set; } // E.g., "image/jpeg", "application/pdf"
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public bool IsDeleted { get; set; }
}
