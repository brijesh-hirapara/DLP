using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Users.Queries
{

    public class GetEmailAvailabilityQuery : IRequest<bool>
    {
        public string Email { get; set; }
    }

    public class GetEmailAvailabilityQueryHandler : IRequestHandler<GetEmailAvailabilityQuery, bool>
    {
        private readonly UserManager<User> _userManager;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUserService;

        public GetEmailAvailabilityQueryHandler(UserManager<User> userManager, IActivityLogger activityLogger, ICurrentUserService currentUserService)
        {
            _userManager = userManager;
            _activityLogger = activityLogger;
            _currentUserService = currentUserService;
        }

        public async Task<bool> Handle(GetEmailAvailabilityQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(request.Email);
                var isAvailable = user == null;

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = isAvailable ? $"Email {request.Email} is available" : $"Email {request.Email} is not available"
                });

                return isAvailable;
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Failed to check email availability", _currentUserService.UserId);
                throw;
            }
        }
    }


}
