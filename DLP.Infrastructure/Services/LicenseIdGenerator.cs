using DLP.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DLP.Infrastructure.Services;

public class LicenseIdGenerator : ILicenseIdGenerator
{
    private readonly IAppDbContext _dbContext;

    public LicenseIdGenerator(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<string> GenerateUniqueLicenseId()
    {
        const string letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string numbers = "0123456789";

        Random random = new();

        string randomLetters = new(Enumerable.Repeat(letters, 3)
                                      .Select(s => s[random.Next(s.Length)]).ToArray());

        string randomNumbers = new(Enumerable.Repeat(numbers, 3)
                                      .Select(s => s[random.Next(s.Length)]).ToArray());

        string licenseId = $"{randomLetters}-{randomNumbers}";

        // Check if the generated licenseId already exists in the database
        while (await _dbContext.Requests.AnyAsync(r => r.LicenseId == licenseId))
        {
            randomLetters = new string(Enumerable.Repeat(letters, 3)
                                              .Select(s => s[random.Next(s.Length)]).ToArray());

            randomNumbers = new string(Enumerable.Repeat(numbers, 3)
                                              .Select(s => s[random.Next(s.Length)]).ToArray());

            licenseId = $"{randomLetters}-{randomNumbers}";
        }

        return licenseId;
    }
}
