using DLP.Application.AccessLevels;
using DLP.Application.Common.Security;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers;


[Authorize]
[Route("access-levels")]
public class AccessLevelController : ApiControllerBase
{
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(typeof(List<AccessLevelDto>), 200)]
    public async Task<IActionResult> GetUsers()
        => Ok(await Mediator.Send(new GetAccessLevelsQuery()
        {
            CurrentUserAccessLevel = AccessLevel
        }));
}