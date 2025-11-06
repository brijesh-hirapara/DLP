namespace DLP.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string subject, string htmlMessage, CancellationToken cancellationToken, params string[] emails);
    Task<bool> TestConnectionAsync(string email, string smtpServer, int port, string userName, string password, bool sendTestEmail = true);
}
