using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace DLP.Application.Users.Commands
{
    public class UpdateUserCommand : IRequest<UpdateUserCommand>
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public Guid LanguageId { get; set; }
        public Guid? MunicipalityId { get; set; }
        public string PlaceOfBirth { get; set; }
        public string Address { get; set; }
        public string PersonalNumber { get; set; }
        public string PhoneNumber { get; set; }

        public Guid? OrganizationId { get; set; }
        public string CreatedById { get; set; }
        public string Comments { get; set; }
        public bool IsCertifiedTechnician { get; set; }
        public List<string> UserGroups { get; set; }
        public IFormFile ProfileImage { get; set; }
    }

    public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, UpdateUserCommand>
    {
        private readonly UserManager<User> _userManager;
        private readonly ILogger<UpdateUserCommandHandler> _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly IActivityLogger _activityLogger;
        private readonly IHostingEnvironment _Environment;

        public UpdateUserCommandHandler(
            UserManager<User> userManager,
            ICurrentUserService currentUserService,
            ILogger<UpdateUserCommandHandler> logger,
            IActivityLogger activityLogger,
            IHostingEnvironment Environment)
        {
            _userManager = userManager;
            _logger = logger;
            _currentUserService = currentUserService;
            _activityLogger = activityLogger;
            _Environment = Environment;
        }

        public async Task<UpdateUserCommand> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(request.Id);
                if (user == null)
                    throw new NotFoundException("User does not exist!");

                string profileFileName = user.ProfileImage;
                if (request.ProfileImage != null)
                {
                    profileFileName = await SaveFileAsync(request.ProfileImage, "ProfileImages");
                    user.ProfileImage = profileFileName;
                }

                user.FirstName = request.FirstName;
                user.LastName = request.LastName;
                user.LanguageId = request.LanguageId;
                user.PlaceOfBirth = request.PlaceOfBirth;
                if (request.IsCertifiedTechnician)
                    user.MunicipalityId = request.MunicipalityId.Value;

                user.Comments = request.Comments;
                user.OrganizationId = request.OrganizationId ?? _currentUserService.OrganizationId;
                user.PersonalNumber = request.PersonalNumber;
                user.PhoneNumber = request.PhoneNumber;
                user.UpdatedAt = DateTime.UtcNow;
                user.UpdatedById = _currentUserService.UserId;

                var result = await _userManager.UpdateAsync(user);

                if (!result.Succeeded)
                {
                    var errorMessages = string.Join("\n", result.Errors.Select(x => x.Description));
                    await _activityLogger.Error(errorMessages, _currentUserService.UserId);
                    _logger.LogError(errorMessages);
                    throw new Exception(errorMessages);
                }
                if (!request.IsCertifiedTechnician)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    await _userManager.RemoveFromRolesAsync(user, roles);
                    await _userManager.AddToRolesAsync(user, request.UserGroups);
                }

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Successfully updated user: {user.FullName}"
                });

                return request;
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Failed to update user!", _currentUserService.UserId);
                throw;
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
}
