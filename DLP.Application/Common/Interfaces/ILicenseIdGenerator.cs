namespace DLP.Application.Common.Interfaces;

public interface ILicenseIdGenerator
{
    Task<string> GenerateUniqueLicenseId();
}
