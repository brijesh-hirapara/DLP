namespace DLP.Application.Common.Interfaces;

public interface ITranslationService
{
    Task<string> Translate(string languageCode, string key, string defaultValue);
    Task<string> Translate(Guid languageId, string key, string defaultValue);
}

