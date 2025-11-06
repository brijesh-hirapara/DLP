using DLP.Application.Codebooks.Commands;
using DLP.Application.Codebooks.DTOs;
using DLP.Application.Codebooks.Queries;
using DLP.Application.Common.Pagination;
using DLP.Controllers.Shared;
using DLP.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CodebookController : ApiControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<CodebookDto>> GetCodebook(Guid id)
    {
        var query = new GetCodebookDetailsQuery(id);
        var codebook = await Mediator.Send(query);

        if (codebook == null)
        {
            return NotFound();
        }

        return Ok(codebook);
    }

    [HttpGet("by-type")]
    public async Task<ActionResult<PaginatedList<CodebookDto>>> GetCodebookByType([FromQuery] GetCodebooksByTypeQuery request)
    {
        return Ok(await Mediator.Send(request));
    }

    [HttpGet]
    public async Task<ActionResult<Dictionary<CodebookTypeEnum, List<CodebookDto>>>> GetAllAsDictionary([FromQuery] GetAllCodebooksQuery request)
    {
        return Ok(await Mediator.Send(request));
    }

    [HttpPost]
    public async Task<IActionResult> AddCodebook([FromBody] AddCodebookCommand command)
    {
        try
        {
            var codebookId = await Mediator.Send(command);
            return CreatedAtAction(nameof(GetCodebook), new { id = codebookId }, codebookId);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }

    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCodebook(Guid id, [FromBody] UpdateCodebookCommand command)
    {

        try
        {
            if (id != command.Id)
            {
                return BadRequest();
            }

            await Mediator.Send(command);

            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
       
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCodebook(Guid id)
    {
        try
        {
            var command = new DeleteCodebookCommand { Id = id };
            await Mediator.Send(command);

            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}