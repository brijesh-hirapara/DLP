using DLP.Application.Common.Pagination;
using DLP.Application.Equipments.Commands;
using DLP.Application.Shipments.Commands;
using DLP.Application.Shipments.DTOs;
using DLP.Application.Shipments.Queries;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class ShipmentsController : ApiControllerBase
    {

        [HttpGet]
        [Produces("application/json")]
        public async Task<ActionResult<PaginatedList<ShipmentsDto>>> GetShipmentsList([FromQuery] GetShipmentsQuery query)
            => Ok(await Mediator.Send(query));


        [HttpGet("carrier-list")]
        [Produces("application/json")]
        public async Task<ActionResult<PaginatedList<ShipmentsDto>>> GetShipmentsCarrierList([FromQuery] GetShipmentsCarrierQuery query)
    => Ok(await Mediator.Send(query));


        [HttpGet("{shipmentId}")]
        public async Task<ActionResult<ShipmentsDto>> GetShipmentDetails([FromRoute] Guid shipmentId)
            => Ok(await Mediator.Send(new GetShipmentDetailsQuery { Id = shipmentId }));


        [HttpPost("{shipmentId}/assign-truck")]
        public async Task<IActionResult> ShipmentAssignTruck([FromRoute] Guid shipmentId, [FromBody] ShipmentAssignTruckDto request)
        {
            try
            {
                await Mediator.Send(new ShipmentAssignTruckCommand
                {
                    ShipmentId = shipmentId,
                    TruckDriverFirstName = request.TruckDriverFirstName,
                    TruckDriverLastName = request.TruckDriverLastName,
                    PassportId = request.PassportId,
                    PhoneNumber = request.PhoneNumber,
                    TruckNumber = request.TruckNumber,
                });
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }


        [HttpPut("{shipmentId}/confirm-pickup-delivery")]
        public async Task<IActionResult> ConfirmPickupAndDelivery([FromRoute] Guid shipmentId)
        {
            try
            {
                await Mediator.Send(new ConfirmPickupAndDeliveryCommand
                {
                    ShipmentId = shipmentId
                });
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPost("upload-pod")]
        public async Task<ActionResult<Guid>> UploadPODFile([FromForm] UploadPODFileCommand command)
        {
            return Ok(await Mediator.Send(command));
        }
    }
}