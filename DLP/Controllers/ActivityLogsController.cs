using DLP.Application.ActivityLogs.Dto;
using DLP.Application.ActivityLogs.Queries;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers
{
    [Authorize]
    [Route("activities")]
    public class ActivityLogsController : ApiControllerBase
    {
        [HttpGet]
        [Produces("application/json")]
        [Authorize("logs:list")]
        [ProducesResponseType(typeof(List<ActivityLogDto>), 200)]
        public async Task<IActionResult> GetActivityLogsQuery([FromQuery] GetActivityLogsQuery query)
            => Ok(await Mediator.Send(query));

    }
}