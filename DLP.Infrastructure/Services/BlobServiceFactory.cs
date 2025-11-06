using DLP.Application.Common.Interfaces;
using System.Collections.Concurrent;

namespace DLP.Infrastructure.Services;

public class BlobServiceFactory : IBlobServiceFactory
{
    private readonly ConcurrentDictionary<string, IBlobService> _blobServices = new ConcurrentDictionary<string, IBlobService>();
    private readonly string _baseDir;

    public BlobServiceFactory(string baseDir)
    {
        _baseDir = baseDir;
    }

    public IBlobService Create(string folderName)
    {
        return _blobServices.GetOrAdd(folderName, name => new BlobService(_baseDir, folderName));
    }
}
