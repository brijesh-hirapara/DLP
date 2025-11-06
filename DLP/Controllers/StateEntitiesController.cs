using DLP.Application.Common.Pagination;
using DLP.Application.Municipalities.DTOs;
using DLP.Application.StateEntities.Commands;
using DLP.Application.StateEntities.Queries;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers;

[ApiController]
[Route("api/state-entities")]
public class StateEntitiesController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<OrdinalPaginatedList<StateEntityDto>>> GetAll([FromQuery] GetAllStateEntitiesQuery query)
    {
        return await Mediator.Send(query);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStateEntity(Guid id, UpdateStateEntityCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        await Mediator.Send(command);
        return Ok("State entity updated successfully");
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<StateEntityDto>> GetStateEntityDetails(Guid id)
    {
        try
        {
            var result = await Mediator.Send(new GetStateEntityDetailQuery { Id = id });
            return Ok(result);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}