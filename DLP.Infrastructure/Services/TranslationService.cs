using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DLP.Infrastructure.Services;

public class TranslationService : ITranslationService
{
    private readonly IAppDbContext _dbContext;

    public TranslationService(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<string> Translate(string languageCode, string key, string defaultValue)
    {
        var language = await _dbContext.Languages
            .Include(l => l.I18nCode)
            .Include(l => l.Translations)
            .FirstOrDefaultAsync(l => l.I18nCode.Code == languageCode);
        if (language == null)
        {
            return defaultValue;
        }

        var existingTranslation = await _dbContext.Translations
            .FirstOrDefaultAsync(x => x.LanguageId == language.Id && x.Key == key);
        if (existingTranslation != null)
        {
            return existingTranslation.Value;
        }

        var translation = new Translation { Key = key, Value = defaultValue, LanguageId = language.Id };
        await _dbContext.Translations.AddAsync(translation);
        await _dbContext.SaveChangesAsync();
        return translation.Value;
    }

    public async Task<string> Translate(Guid languageId, string key, string defaultValue)
    {
        var language = await _dbContext.Languages
            .Include(l => l.I18nCode)
            .Include(l => l.Translations)
            .FirstOrDefaultAsync(l => l.Id == languageId);

        if (language == null)
        {
            return defaultValue;
        }

        var existingTranslation = await _dbContext.Translations
            .FirstOrDefaultAsync(x => x.LanguageId == language.Id && x.Key.Contains(key));
        if (existingTranslation != null)
        {
            return existingTranslation.Value;
        }

        var translation = new Translation { Key = key, Value = defaultValue, LanguageId = language.Id };
        await _dbContext.Translations.AddAsync(translation);
        await _dbContext.SaveChangesAsync();
        return translation.Value;
    }
}
