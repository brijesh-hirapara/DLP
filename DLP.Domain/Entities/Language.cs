namespace DLP.Domain.Entities;

public class Language:SyncBase
{
    public Guid Id { get; set; }
    public int Position { get; set; }
    public Guid I18nCodeId { get; set; }
    public bool IsDefault { get; set; }
    public virtual I18nLanguageCode I18nCode { get; set; }
    public virtual List<Translation> Translations { get; set; }
}
