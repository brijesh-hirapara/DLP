using System;
using DLP.Application.Dashboard.Queries;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardController: ApiControllerBase
    {
        [HttpGet("plain-stats")]
        public async Task<IActionResult> GetPlainStats()
        {
            return Ok(await Mediator.Send(new GetPlainDashboardStatsQuery()));
        }
    }
}

