using DLP.Application.Common.Pagination;
using DLP.Application.TransportManagemen.Commands;
using DLP.Application.TransportManagemen.DTOs;
using DLP.Application.TransportManagemen.Queries;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class TransportManagementController : ApiControllerBase
    {

        [HttpPost]
        public async Task<IActionResult> CreateTransportRequest([FromBody] CreateTransportRequestCommand command)
        {
            try
            {
                await Mediator.Send(command);
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet]
        [Produces("application/json")]
        public async Task<ActionResult<PaginatedList<TransportRequestDto>>> GetTransportRequestList([FromQuery] GetTransportRequesQuery query)
            => Ok(await Mediator.Send(query));

        [HttpGet("carrier-list")]
        [Produces("application/json")]
        public async Task<ActionResult<PaginatedList<TransportRequestDto>>> GetCarrierTransportRequestList([FromQuery] GetCarrierTransportRequesQuery query)
          => Ok(await Mediator.Send(query));

        [HttpGet("{transportRequestId}")]
        public async Task<ActionResult<TransportRequestDto>> GetTransportRequestDetails([FromRoute] Guid transportRequestId)
            => Ok(await Mediator.Send(new GetTransportRequestDetailsQuery { Id = transportRequestId }));


        [HttpPut("{transportRequestId}/submit-offer")]
        public async Task<IActionResult> CarrierSubmitOfferRequest([FromRoute] Guid transportRequestId, [FromBody] TransportCarrierDto request)
        {
            try
            {
                await Mediator.Send(new CarrierSubmitOfferRequestCommand
                {
                    CurrentUserId = UserId,
                    TransportRequestId = transportRequestId,
                    TransportCarrierId = request.Id,
                    Price = request.Price,
                    EstimatedPickupDateTimeFrom = request.EstimatedPickupDateTimeFrom,
                    EstimatedPickupDateTimeTo = request.EstimatedPickupDateTimeTo,
                    EstimatedDeliveryDateTimeFrom = request.EstimatedDeliveryDateTimeFrom,
                    EstimatedDeliveryDateTimeTo = request.EstimatedDeliveryDateTimeTo,
                    OfferValidityDate = request.OfferValidityDate,
                    TruckTypeId = request.TruckTypeId
                });
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut("{transportRequestId}/reject-offer")]
        public async Task<IActionResult> CarrierRejectRequest([FromRoute] Guid transportRequestId, [FromBody] Guid id)
        {
            await Mediator.Send(new CarrierRejectRequestCommand
            {
                CurrentUserId = UserId,
                TransportRequestId = transportRequestId,
                TransportCarrierId = id
            });
            return Ok();
        }

        [HttpPut("update-template")]
        public async Task<IActionResult> UpdateTransportTemplate([FromBody] UpdateTransportTemplateCommand command)
        {
            try
            {
                await Mediator.Send(command);
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet("template-list")]
        [Produces("application/json")]
        public async Task<ActionResult<PaginatedList<TransportTemplateDto>>> GetTransportTemplateList([FromQuery] GetTransportTemplateQuery query)
            => Ok(await Mediator.Send(query));

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteTransportTemplate([FromRoute] string id)
        {
            return Ok(await Mediator.Send(new DeleteTransportTemplateCommand { TransportTemplateId = id }));
        }

        [HttpPost("InvitedCarriers")]
        public async Task<IActionResult> InvitedCarriers([FromBody] InvitedCarriersCommand command)
        {
            try
            {
                await Mediator.Send(command);
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet("invited-carrier")]
        [Produces("application/json")]
        public async Task<ActionResult<PaginatedList<TransportCarrierListDto>>> GetCarrierList([FromQuery] GetCarrierListQuery query)
            => Ok(await Mediator.Send(query));


        [HttpDelete("DeleteInvitedCarriers")]
        public async Task<IActionResult> DeleteInvitedCarriers([FromBody] DeleteInvitedCarriersCommand command)
        {
            try
            {
                await Mediator.Send(command);
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }


        [HttpGet("choose-offer")]
        [Produces("application/json")]
        public async Task<ActionResult<PaginatedList<TransportCarrierChooseOfferDto>>> GetChooseOfferList([FromQuery] GetChooseOfferListQuery query)
   => Ok(await Mediator.Send(query));



        [HttpGet("superadmin-offer")]
        [Produces("application/json")]
        public async Task<ActionResult<PaginatedList<TransportCarrierAdminOfferDto>>> GetAdminOfferList([FromQuery] GetAdminOfferListQuery query)
           => Ok(await Mediator.Send(query));


        [HttpPut("{transportRequestId}/admin-approved-offer")]
        public async Task<IActionResult> AdminApprovedOfferRequest([FromRoute] Guid transportRequestId, [FromBody] TransportCarrierAdminApprovedOfferDto request)
        {
            try
            {
                await Mediator.Send(new AdminApprovedOfferRequestCommand
                {
                    CurrentUserId = UserId,
                    TransportRequestId = transportRequestId,
                    TransportCarrierId = request.Id,
                    ProfitMargin = request.ProfitMargin,
                    AdminApprovedPrice = request.AdminApprovedPrice,
                });
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut("{transportRequestId}/shipper-book-offer")]
        public async Task<IActionResult> ShipperBookOfferRequest([FromRoute] Guid transportRequestId, [FromQuery] Guid transportCarrierId)
        {
            try
            {
                await Mediator.Send(new ShipperBookOfferRequestCommand
                {
                    TransportRequestId = transportRequestId,
                    TransportCarrierId = transportCarrierId,
                });
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}