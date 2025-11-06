using System;
using DLP.Application.Common.Pagination;
using DLP.Application.Equipments.Commands;
using DLP.Application.Equipments.DTOs;
using DLP.Application.Equipments.Queries;
using DLP.Controllers.Shared;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EquipmentsController : ApiControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<OrdinalPaginatedList<EquipmentDto>>> GetEquipments(
            [FromQuery] GetEquipmentsQuery query)
        {
            return Ok(await Mediator.Send(query));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EquipmentDto>> GetEquipment(Guid id)
        {
            var query = new GetSingleEquipmentQuery { Id = id };
            return Ok(await Mediator.Send(query));
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateEquipment([FromForm] CreateEquipmentCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        [HttpPut]
        public async Task<IActionResult> UpdateEquipment([FromForm] UpdateEquipmentCommand command)
        {
            try
            {
                await Mediator.Send(command);
                return NoContent();
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
            
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEquipment(Guid id)
        {
            try
            {
                var command = new DeleteEquipmentCommand { Id = id };
                await Mediator.Send(command);
                return NoContent();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
         
        }

        [HttpPost("{id}/archive")]
        public async Task<IActionResult> ArchiveEquipment(Guid id)
        {
            var command = new ArchiveEquipmentCommand { Id = id };
            await Mediator.Send(command);
            return NoContent();
        }

        [HttpGet("{id}/activities")]
        public async Task<ActionResult<List<EquipmentActivityDto>>> GetEquipmentActivities(Guid id)
        {
            var query = new GetEquipmentActivitiesQuery { EquipmentId = id };
            return Ok(await Mediator.Send(query));
        }

        [HttpGet("{id}/technician-certificate-number/{certificateNumber}")]
        public async Task<ActionResult<TechnicianForActivityDto>> GetTechnicianForEquipment([FromRoute] Guid id,
            [FromRoute] string certificateNumber)
        {
            try
            {
                return Ok(await Mediator.Send(new GetTechnicianForActivityQuery
                {
                    EquipmentId = id,
                    TechnicianCertificateNumber = certificateNumber
                }));
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
            
        }

        [HttpPost("create-activity")]
        public async Task<IActionResult> CreateEquipmentActivity([FromForm] CreateEquipmentActivityCommand command)
        {
            await Mediator.Send(command);
            var activities = await Mediator.Send(new GetEquipmentActivitiesQuery { EquipmentId = command.EquipmentId });
            return Ok(activities);
        }
    }
}