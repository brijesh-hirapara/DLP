using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace DLP.Application.Users.Commands;

public class UpdateProfileCommand : IRequest<Unit>
{
    public string Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public Guid MunicipalityId { get; set; }
    public Guid? OrganizationId { get; set; }
    public string PhoneNumber { get; set; }
    public Guid? LanguageId { get; set; }

    public IFormFile ProfileImage { get; set; }
    public IFormFile BannerImage { get; set; }
}

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, Unit>
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<UpdateProfileCommandHandler> _logger;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUser;
    private readonly IHostingEnvironment _Environment;

    public UpdateProfileCommandHandler(
        UserManager<User> userManager,
        ILogger<UpdateProfileCommandHandler> logger,
        IActivityLogger activityLogger,
        ICurrentUserService currentUser,
        IHostingEnvironment Environment)
    {
        _userManager = userManager;
        _logger = logger;
        _activityLogger = activityLogger;
        _currentUser = currentUser;
        _Environment = Environment;
    }

    public async Task<Unit> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        string errorMessage = string.Empty;
        try
        {

            var user = await _userManager.FindByIdAsync(request.Id);
            if (user == null)
            { 
                errorMessage = "User not found!";
                throw new Exception(errorMessage);
            }
            // Upload files if provided
            string profileFileName = user.ProfileImage;
            string bannerFileName = user.BannerImage;

            if (request.ProfileImage != null)
            {
                profileFileName = await SaveFileAsync(request.ProfileImage, "ProfileImages");
                user.ProfileImage = profileFileName;
            }

            if (request.BannerImage != null)
            {
                bannerFileName = await SaveFileAsync(request.BannerImage, "BannerImages");
                user.BannerImage = bannerFileName;
            }


            //if (user.ProfileImage != null)
            //{
            //    string contentPath = _Environment.ContentRootPath;
            //    string wwwPath = _Environment.WebRootPath;

            //    string path = Path.Combine(contentPath, "wwwroot", "ProfileImages");
            //    if (!Directory.Exists(path))
            //    {
            //        Directory.CreateDirectory(path);
            //    }
            //    string extension = Path.GetExtension(request.ProfileImage.FileName);
            //    fileName = $"{Guid.NewGuid()}{extension}";
            //    string filePath = Path.Combine(path, fileName);
            //    using (FileStream stream = new FileStream(filePath, FileMode.Create))
            //    {
            //        request.ProfileImage.CopyTo(stream);
            //    }
            //}
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.PhoneNumber = request.PhoneNumber;
            user.LanguageId = request.LanguageId;
            user.OrganizationId = request.OrganizationId ?? user.OrganizationId;
            user.MunicipalityId = request.MunicipalityId;
            user.UpdatedAt = DateTime.UtcNow;
            
            

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errorMessages = string.Join("\n", result.Errors.Select(x => x.Description));
                await _activityLogger.Error(errorMessages, _currentUser.UserId);
                _logger.LogError(errorMessages);
                throw new Exception(errorMessages);
            }

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUser.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = $"Successfully updated user's profile, user: {user.FullName}"
            });

            return Unit.Value;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to update User's profile!", _currentUser.UserId);
            throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
        }
    }
    private async Task<string> SaveFileAsync(IFormFile file, string folderName)
    {
        string contentPath = _Environment.ContentRootPath;
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
}
