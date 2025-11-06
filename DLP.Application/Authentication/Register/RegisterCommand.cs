using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace DLP.Application.Authentication.Register;
public class RegisterCommand : IRequest<Unit>
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
}

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Unit>
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<RegisterCommandHandler> _logger;
    private readonly IAppDbContext _context;
    private readonly IEmailService _emailService;

    public RegisterCommandHandler(
        UserManager<User> userManager,
        ILogger<RegisterCommandHandler> logger,
        IAppDbContext context,
        IEmailService emailService)
    {
        _userManager = userManager;
        _context = context;
        _logger = logger;
        _emailService = emailService;
    }

    public async Task<Unit> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var user = new User
        {
            UserName = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
        };

        var creationResult = await _userManager.CreateAsync(user, request.Password);
        if (!creationResult.Succeeded)
        {
            var errorMessages = string.Join("\n", creationResult.Errors.Select(x => x.Description));
            _logger.LogError(errorMessages);
            throw new Exception(errorMessages);
        }

        _logger.LogInformation($"User [{request.Email}] was registered in the system.");
        return Unit.Value;
    }
}
