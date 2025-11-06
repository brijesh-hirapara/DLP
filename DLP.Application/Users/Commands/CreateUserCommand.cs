using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Security;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DLP.Application.Users.Commands;

public class CreateUserCommand : IRequest<string>
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public Guid LanguageId { get; set; }
    public Guid? MunicipalityId { get; set; }
    public string PlaceOfBirth { get; set; }
    public string PhoneNumber { get; set; }
    public string Address { get; set; }
    public string PersonalNumber { get; set; }
    public Guid? OrganizationId { get; set; }
    public string CreatedById { get; set; }
    public string Comments { get; set; }
    public bool IsCertifiedTechnician { get; set; }
    public List<string> UserGroups { get; set; }
    public IFormFile ProfileImage { get; set; }
}

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, string>
{
    private readonly IAppDbContext _dbContext;
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly IEmailCommunicationService _emailCommunicationService;
    private readonly ILogger<CreateUserCommandHandler> _logger;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUser;
    private readonly IHostingEnvironment _environment;


    public CreateUserCommandHandler(
        IAppDbContext dbContext,
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
        IEmailCommunicationService emailCommunicationService,
        ILogger<CreateUserCommandHandler> logger,
        IActivityLogger activityLogger,
        ICurrentUserService currentUser,
        IHostingEnvironment environment)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _roleManager = roleManager;
        _emailCommunicationService = emailCommunicationService;
        _logger = logger;
        _activityLogger = activityLogger;
        _currentUser = currentUser;
        _environment = environment;
    }

    public async Task<string> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        try
        {
            string profileFileName = null;
            if (request.ProfileImage != null)
            {
                profileFileName = await SaveFileAsync(request.ProfileImage, "ProfileImages");
            }

            var user = new User
            {
                NormalizedEmail = request.Email,
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                LanguageId = request.LanguageId,
                PlaceOfBirth = request.PlaceOfBirth,
                PersonalNumber = request.PersonalNumber,
                Address = request.Address,
                Comments = request.Comments,
                //StateEntityId = stateEntityId.Value,
                IsCertifiedTechnician = request.IsCertifiedTechnician,
                OrganizationId = request.OrganizationId,
                PhoneNumber = request.PhoneNumber,
                //MunicipalityId = municipalityId,
                MustChangePassword = true,
                CreatedAt = DateTime.UtcNow,
                CreatedById = request.CreatedById,
                ProfileImage = profileFileName,  // <-- Save filename in DB
                AccessLevel = await GetAccessLevelFromGroups(request.UserGroups)
            };

            var oneTimePassword = PasswordUtils.GenerateOTP();
            var result = await _userManager.CreateAsync(user, oneTimePassword);

            if (!result.Succeeded)
            {
                var errorMessages = string.Join("\n", result.Errors.Select(x => x.Description));
                await _activityLogger.Error(errorMessages, _currentUser.UserId);
                _logger.LogError(errorMessages);
                throw new Exception(errorMessages);
            }


            await _userManager.AddToRolesAsync(user, request.UserGroups);
            await _emailCommunicationService.SendOneTimePasswordEmail(request.Email, oneTimePassword, cancellationToken);

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUser.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully created new user!"
            });

            return user.Id;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to create new User!", _currentUser.UserId);
            throw;
        }
    }

    private async Task<string> SaveFileAsync(IFormFile file, string folderName)
    {
        string contentPath = _environment.ContentRootPath;
        string path = Path.Combine(contentPath, "wwwroot", folderName);

        if (!Directory.Exists(path))
        {
            Directory.CreateDirectory(path);
        }

        string extension = Path.GetExtension(file.FileName);
        string fileName = $"{Guid.NewGuid()}{extension}";
        string filePath = Path.Combine(path, fileName);

        using (FileStream stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return fileName;
    }


    private async Task<AccessLevelType> GetAccessLevelFromGroups(List<string> groupNames)
    {
        var maxAccessLevel = (await _roleManager.Roles
                .Where(r => groupNames.Contains(r.Name!))
                .ToListAsync())
            .Max(r => r.AccessLevel);
        return maxAccessLevel;
    }
}
