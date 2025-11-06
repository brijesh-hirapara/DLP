using DLP.Application.Common.Interfaces;
using MediatR;

public class TestSmtpConnectionCommand : IRequest<bool>
{
    public string Email { get; set; }
    public string SmtpServer { get; set; }
    public int Port { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }

    public TestSmtpConnectionCommand(string email, string smtpServer, int port, string username, string password)
    {
        Email = email;
        SmtpServer = smtpServer;
        Port = port;
        Username = username;
        Password = password;
    }
}

public class TestSmtpConnectionCommandHandler : IRequestHandler<TestSmtpConnectionCommand, bool>
{
    private readonly IEmailService emailService;

    public TestSmtpConnectionCommandHandler(IEmailService emailService)
    {
        this.emailService = emailService;
    }

    public async Task<bool> Handle(TestSmtpConnectionCommand command, CancellationToken cancellationToken)
    {
        return await emailService.TestConnectionAsync(command.Email, command.SmtpServer, command.Port, command.Username, command.Password);
    }
}
