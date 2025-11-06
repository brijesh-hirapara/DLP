using DLP.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace DLP.Application.Authentication.Profile.Commands;
public class UpdateUserProfileCommand : IRequest<Unit>
{
    public string UserId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public Language Language { get; set; }
}

public class UpdateProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, Unit>
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<UpdateProfileCommandHandler> _logger;

    public UpdateProfileCommandHandler(UserManager<User> userManager, ILogger<UpdateProfileCommandHandler> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<Unit> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null)
        {
            throw new Exception($"User with Id={request.UserId} wasn't not found");
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;
        user.PhoneNumber = request.PhoneNumber;
        user.Language = request.Language;

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var errorMessages = string.Join("\n", updateResult.Errors.Select(x => x.Description));
            _logger.LogError(errorMessages);
            throw new Exception(errorMessages);
        }

        _logger.LogInformation($"User [{request.UserId}] was updated successfully.");
        return Unit.Value;
    }
}