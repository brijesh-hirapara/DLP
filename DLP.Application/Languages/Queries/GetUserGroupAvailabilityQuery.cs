using DLP.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace DLP.Application.Languages.Queries;

public class GetUserGroupAvailabilityQuery : IRequest<bool>
{
    public string Name { get; set; }
}

public class GetUserGroupAvailabilityQueryHandler : IRequestHandler<GetUserGroupAvailabilityQuery, bool>
{
    private readonly RoleManager<Role> _roleManager;

    public GetUserGroupAvailabilityQueryHandler(RoleManager<Role> roleManager)
    {
        _roleManager = roleManager;
    }

    public async Task<bool> Handle(GetUserGroupAvailabilityQuery request, CancellationToken cancellationToken)
    {
        var role = await _roleManager.FindByNameAsync(request.Name);
        return role == null;
    }
}
