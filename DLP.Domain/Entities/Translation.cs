namespace DLP.Domain.Entities;

public class Translation: SyncBase
{
    public string Key { get; set; }
    public string Value { get; set; }
    public Guid LanguageId { get; set; }
    public virtual Language Language { get; set; }
}