

using DLP.Application.Common.Interfaces;

namespace DLP.Infrastructure.Services;

public class BlobService : IBlobService
{
    private readonly string _baseDir;

    public BlobService(string mainDir, string folderName)
    {
        _baseDir = Path.Combine(mainDir, folderName);
        Directory.CreateDirectory(_baseDir);
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName)
    {
        var filePath = Path.Combine(_baseDir, fileName);
        using var outputStream = new FileStream(filePath, FileMode.Create, FileAccess.Write);
        await fileStream.CopyToAsync(outputStream);
        return filePath;
    }

    public Task DeleteFileAsync(string fileName)
    {
        var filePath = Path.Combine(_baseDir, fileName);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
        return Task.CompletedTask;
    }
}
