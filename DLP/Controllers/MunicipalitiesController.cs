using DLP.Application.Common.Pagination;
using DLP.Application.Municipalities.Commands;
using DLP.Application.Municipalities.DTOs;
using DLP.Application.Municipalities.Queries;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers;


[ApiController]
[Route("api/municipalities")]
public class MunicipalitiesController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<OrdinalPaginatedList<MunicipalityDto>>> GetAll([FromQuery] GetAllMunicipalitiesQuery query)
    {
        return await Mediator.Send(query);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MunicipalityDto>> GetMunicipalityDetail(Guid id)
    {
        try
        {
            var municipality = await Mediator.Send(new GetMunicipalityDetailQuery { Id = id });
            return Ok(municipality);
        }
        catch (Exception ex)
        {
            // Log the exception if needed
            return NotFound(ex.Message);
        }
    }


    [HttpPost]
    public async Task<IActionResult> AddNewMunicipality([FromBody] AddNewMunicipalityCommand command)
    {
        await Mediator.Send(command);
        return Ok("Municipality added successfully");
    }

    [HttpPut]
    public async Task<IActionResult> UpdateMunicipality([FromBody] UpdateMunicipalityCommand command)
    {
        try
        {
            await Mediator.Send(command);
            return Ok("Municipality updated successfully");
        }
        catch (Exception ex)
        {
            // Log the exception if needed
            return NotFound(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMunicipality(Guid id)
    {
        try
        {
            await Mediator.Send(new DeleteMunicipalityCommand { Id = id });
            return Ok("Municipality deleted successfully");
        }
        catch (Exception ex)
        {
            // Log the exception if needed
            return NotFound(ex.Message);
        }
    }
}
