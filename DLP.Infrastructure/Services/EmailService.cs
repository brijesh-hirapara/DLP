using DLP.Application.Common.Interfaces;
using DLP.Application.EmailConfiguration.Queries;
using MailKit.Net.Smtp;
using MailKit.Security;
using MediatR;
using Microsoft.Extensions.Logging;
using MimeKit;
using MimeKit.Text;

namespace DLP.Infrastructure.Services;
public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly IMediator _mediator;

    public EmailService(ILogger<EmailService> logger, IMediator mediator)
    {
        _logger = logger;
        _mediator = mediator;
    }

    public async Task SendEmailAsync(string subject, string htmlMessage, CancellationToken cancellationToken, params string[] emails)
    {
        try
        {
            var options = await _mediator.Send(new GetActiveEmailOptionsQuery(), cancellationToken);
            // build message
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(options.From));
            message.To.AddRange(emails.Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => MailboxAddress.Parse(x)));
            message.Subject = subject;
            message.Body = new TextPart(TextFormat.Html) { Text = htmlMessage };

            // send email
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(options.SmtpHost, options.SmtpPort, SecureSocketOptions.StartTls, cancellationToken);
            await smtp.AuthenticateAsync(options.SmtpUser, options.SmtpPass, cancellationToken);
            await smtp.SendAsync(message, cancellationToken);
            await smtp.DisconnectAsync(true, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError("Email failed to be send", ex);
        }
    }

    public async Task SendEmailToMultipleAsync(List<string> emails, string subject, string htmlMessage, CancellationToken cancellationToken)
    {
        try
        {
            var options = await _mediator.Send(new GetActiveEmailOptionsQuery(), cancellationToken);
            // build message
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(options.From));
            message.To.AddRange(emails.Select(x => MailboxAddress.Parse(x)));
            message.Subject = subject;
            message.Body = new TextPart(TextFormat.Html) { Text = htmlMessage };

            // send email
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(options.SmtpHost, options.SmtpPort, SecureSocketOptions.StartTls, cancellationToken);
            await smtp.AuthenticateAsync(options.SmtpUser, options.SmtpPass, cancellationToken);
            await smtp.SendAsync(message, cancellationToken);
            await smtp.DisconnectAsync(true, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError("Email failed to be send", ex);
        }
    }

    public async Task<bool> TestConnectionAsync(string email, string smtpServer, int port, string userName, string password, bool sendTestEmail = true)
    {
        try
        {
            // Send a test email to check the connection
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(email));
            message.To.Add(MailboxAddress.Parse(userName));
            message.Subject = "Test SMTP Connection";
            message.Body = new TextPart("plain") { Text = "This test email confirms that the SMTP configurations are working properly." };


            // send email
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(smtpServer, port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(userName, password);

            if (sendTestEmail)
                await smtp.SendAsync(message);

            await smtp.DisconnectAsync(true);

            return true; // Connection and email sending were successful
        }
        catch (Exception ex)
        {
            // Handle any exceptions or error scenarios
            Console.WriteLine(ex.ToString());
            return false; // Connection or email sending failed
        }
    }

}
