using DLP.Application.Authentication.Profile.DTOs;
using DLP.Application.Municipalities.DTOs;
using DLP.Domain.Entities;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace DLP.Application.Authentication.Profile.Queries
{
    public class GetUserProfileQuery : IRequest<AccountProfileDto>
    {
        public string UserId { get; set; }
    }

    public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, AccountProfileDto>
    {
        private readonly UserManager<User> _userManager;
        private readonly IMapper _mapper;

        public GetUserProfileQueryHandler(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task<AccountProfileDto> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId);
            var response = user.Adapt<AccountProfileDto>();
            return response;
        }
    }
}
