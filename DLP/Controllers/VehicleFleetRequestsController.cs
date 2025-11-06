using DLP.Application.Common.Pagination;
using DLP.Application.Requests.Commands;
using DLP.Application.Dashboard.Queries;
using DLP.Application.Requests.DTOs;
using DLP.Application.Requests.Queries;
using DLP.Application.VehicleFleetRequests.Commands;
using DLP.Application.VehicleFleetRequests.DTOs;
using DLP.Application.VehicleFleetRequests.Queries;
using DLP.Controllers.Shared;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers
{
    [ApiController]
    public class VehicleFleetRequestsController : ApiControllerBase
    {
        private readonly IMediator _mediator;

        public VehicleFleetRequestsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [Produces("application/json")]
        public async Task<ActionResult<PaginatedList<ListVehicleFleetRequestDto>>> GetVehicleFleet([FromQuery] GetVehicleFleetRequestsQuery query)
        => Ok(await Mediator.Send(query));

        [HttpPost("create")]
        public async Task<IActionResult> CreateVehicleFleetRequest([FromForm] CreateVehicleFleetRequestCommand command)
        {
            try
            {
                var CurrentUserId = UserId;
                await Mediator.Send(command);
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
                throw;
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVehicleFleetRequestById(Guid id)
        {
            var result = await _mediator.Send(new GetVehicleFleetRequestByIdQuery
            {
                VehicleFleetRequestId = id
            });

            if (result == null)
                return NotFound($"Vehicle Fleet Request not found with Id: {id}");

            return Ok(result);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateVehicleFleetRequest([FromBody] UpdateVehicleFleetRequestCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveVehicleFleetRequest([FromRoute] Guid id, [FromBody] string comments)
        {
            try
            {
                await Mediator.Send(new ApproveVehicleFleetRequestCommand
                {
                    CurrentUserId = UserId,
                    VehicleFleetRequestId = id,
                    Comments = comments
                });
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectVehicleFleetRequest([FromRoute] Guid id, [FromBody] string comments)
        {
            await Mediator.Send(new RejectVehicleFleetRequestCommand
            {
                CurrentUserId = UserId,
                VehicleFleetRequestId = id,
                Comments = comments
            });
            return Ok();
        }


        [HttpGet("latest-request")]
        public async Task<IActionResult> GetVehicleFleetLatestRequest()
        {
            var result = await Mediator.Send(new GetVehicleFleetLatestRequestQuery());

            //if (result == null)
            //    return NotFound($"Vehicle Fleet Latest Request not found");

            return Ok(result);
        }
    }
}
