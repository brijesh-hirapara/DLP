namespace DLP.Application.Common.Interfaces;

public interface IBlacklistService
{
    void AddToBlacklist(params string[] emails);
    void RemoveFromBlacklist(params string[] emails);
    bool IsBlacklisted(string email);
}

