namespace DLP.Application.Common.Interfaces;
/// <summary>
/// This is only a mock interface, do not inject it anywhere instead use IBlobServiceFactory for your needs
/// </summary>
public interface IBlobService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName);
    Task DeleteFileAsync(string fileName);
}
