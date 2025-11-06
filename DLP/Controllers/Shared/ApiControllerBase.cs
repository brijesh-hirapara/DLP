using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers.Shared
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class ApiControllerBase : ControllerBase
    {
        private IMediator _mediator;
        private ICurrentUserService _currentUserService;
        private UserManager<User> _userManager;

        protected IMediator Mediator => _mediator ??= HttpContext.RequestServices.GetService<IMediator>();

        protected UserManager<User> UserManager => _userManager ??= HttpContext.RequestServices.GetService<UserManager<User>>();
        protected ICurrentUserService CurrentUserService => _currentUserService ??= HttpContext.RequestServices.GetService<ICurrentUserService>();

        public string UserId => CurrentUserService.UserId;
        public string Email => CurrentUserService.UserName;
        public AccessLevelType AccessLevel => CurrentUserService.AccessLevel;
        protected Guid? OrganizationId => CurrentUserService.OrganizationId;

        protected async Task<bool> InRoleAsync(string role)
        {
            var user = await UserManager.FindByIdAsync(UserId);
            return await _userManager.IsInRoleAsync(user, role);
        }

        protected string GetAccessToken()
        {
            if (HttpContext.Request.Headers.TryGetValue("Authorization", out var authorizationHeader))
            {
                var accessToken = authorizationHeader.ToString().Replace("Bearer ", string.Empty);
                return accessToken;
            }

            return null;
        }
    }
}
