using DLP.Application.UserGroups.DTOs;
using DLP.Application.UserGroups.Queries;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers;

[Route("modules")]
public class ModulesController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ModuleFunctionalitiesDto>>> GetModulesWithFunctionalities([FromQuery] GetModulesWithFunctionalitiesQuery query)
    {
        return Ok(await Mediator.Send(query));
    }
}
