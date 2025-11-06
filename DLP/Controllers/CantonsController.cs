using DLP.Application.Cantons.Commands;
using DLP.Application.Cantons.DTOs;
using DLP.Application.Cantons.Queries;
using DLP.Application.Common.Pagination;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers;

[ApiController]
[Route("api/cantons")]
public class CantonsController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<OrdinalPaginatedList<CantonDto>>> GetAll([FromQuery] GetAllCantonsQuery query)
    {
        return await Mediator.Send(query);
    }

    [HttpPost]
    public async Task<IActionResult> AddCanton(AddNewCantonCommand command)
    {
        await Mediator.Send(command);
        return Ok("Canton added successfully");
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCanton(Guid id, UpdateCantonCommand command)
    {
        try
        {
            if (id != command.Id)
                return BadRequest("Id mismatch");

            await Mediator.Send(command);
            return Ok("Canton updated successfully");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
     
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCanton(Guid id)
    {
        try
        {
            await Mediator.Send(new DeleteCantonCommand { Id = id });
            return Ok("Canton deleted successfully");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
       
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CantonDto>> GetCantonDetails(Guid id)
    {
        try
        {
            var result = await Mediator.Send(new GetCantonDetailQuery { Id = id });
            return Ok(result);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

}

