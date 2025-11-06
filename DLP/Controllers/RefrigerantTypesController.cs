using DLP.Application.Common.Pagination;
using DLP.Application.RefrigerantTypes.Commands;
using DLP.Application.RefrigerantTypes.DTO;
using DLP.Application.RefrigerantTypes.Queries;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers
{
    [Route("api/[controller]")]
    public class RefrigerantTypesController : ApiControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<OrdinalPaginatedList<RefrigerantTypeDto>>> GetRefrigerantTypes([FromQuery] GetRefrigerantTypesQuery query)
        {
            var result = await Mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSingleRefrigerantType(Guid id)
        {
            var query = new GetSingleRefrigerantTypeQuery { Id = id };
            var result = await Mediator.Send(query);
            return result != null ? Ok(result) : NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> CreateRefrigerantType([FromBody] CreateRefrigerantTypeCommand command)
        {
            var result = await Mediator.Send(command);
            return CreatedAtAction(nameof(GetSingleRefrigerantType), new { id = result }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRefrigerantType(Guid id, [FromBody] UpdateRefrigerantTypeCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest("The ID in the URL must match the ID in the provided object.");
            }

            var result = await Mediator.Send(command);

            return result ? Ok() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> SoftDeleteRefrigerantType(Guid id)
        {
            var command = new DeleteRefrigerantTypeCommand { Id = id };
            var result = await Mediator.Send(command);

            return result ? Ok() : NotFound();
        }
    }

}

