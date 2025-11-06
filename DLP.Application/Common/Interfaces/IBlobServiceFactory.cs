namespace DLP.Application.Common.Interfaces;
public interface IBlobServiceFactory
{
    IBlobService Create(string folderName);
}