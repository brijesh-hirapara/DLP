using DLP.Application.CertifiedTechnicians.Commands;
using DLP.Application.CertifiedTechnicians.DTO;
using DLP.Application.CertifiedTechnicians.DTOs;
using DLP.Application.CertifiedTechnicians.Queries;
using DLP.Application.Common.Pagination;
using DLP.Application.Qualifications.Commands;
using DLP.Application.Users.Commands;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers
{
    public class CertifiedTechniciansController : ApiControllerBase
    {
        [HttpPost]
        [Authorize("registers:add-certified-technicians")]
        public async Task<IActionResult> CreateCertifiedTechnician([FromForm] CreateCertifiedTechnicianCommand request)
        {
            try
            {
                return Ok(await Mediator.Send(request));
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }

        }

        [HttpGet("{id}")]
        [Produces("application/json")]
        [ProducesResponseType(typeof(CertifiedTechnicianDto), 200)]
        //[Authorize("registers:view-details-of-certified-technicians")] // TODO: bone me multiple kqyre CRA - company-technicians:view-details || registers:view-details-of-certified-technicians
        public async Task<IActionResult> GetCertfiedTechnicians([FromRoute] string id)
        {
            try
            {
                return Ok(await Mediator.Send(new GetCertifiedTechnicianQuery { TechnicianId = id }));
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
           
        }

        [HttpGet("list")]
        [Produces("application/json")]
        [ProducesResponseType(typeof(PaginatedList<CertifiedTechnicianDto>), 200)]
        [Authorize("registers:list-of-certified-technicians")]
        public async Task<IActionResult> GetCertfiedTechnicians([FromQuery] GetCertifiedTechniciansQuery query)
            => Ok(await Mediator.Send(query));

        [HttpGet("company-technicians")]
        [Produces("application/json")]
        [ProducesResponseType(typeof(PaginatedList<CertifiedTechnicianDto>), 200)]
        [Authorize("company-technicians:list")]
        public async Task<IActionResult> GetMyTechnicians([FromQuery] GetMyTechniciansQuery query)
         => Ok(await Mediator.Send(query));

        [HttpPost("{id}/terminate-employment")]
        public async Task<IActionResult> TerminateEmployment([FromRoute] string id)
        {
            try
            {
                return Ok(await Mediator.Send(new EndCurrentEmploymentCommand { TechnicianId = id }));
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }

        [HttpGet("{id}/qualifications")]
        [Produces("application/json")]
        [ProducesResponseType(typeof(PaginatedList<CertifiedTechnicianDto>), 200)]
        //[Authorize("registers:view-details-of-certified-technicians")]
        public async Task<IActionResult> GetQualifications([FromRoute] string id)
            => Ok(await Mediator.Send(new GetQualificationsQuery { CertifiedTechnicianId = id }));


        [HttpGet("by-serial-number/{serialNumber}")]
        [Produces("application/json")]
        [ProducesResponseType(typeof(CertifiedTechnicianDto), 200)]
        // [Authorize("registers:view-details-of-certified-technicians")]
        public async Task<IActionResult> GetTechnicianFromSerialNumber([FromRoute] string serialNumber)
            => Ok(await Mediator.Send(new GetTechnicianFromSerialNumberQuery { SerialNumber = serialNumber }));


        [HttpGet("employment-history")]
        [Produces("application/json")]
        [ProducesResponseType(typeof(PaginatedList<CertifiedTechnicianDto>), 200)]
        // [Authorize("registers:view-details-of-certified-technicians")]
        public async Task<IActionResult> GetEmploymentHistory([FromQuery] string? id)
            => Ok(await Mediator.Send(new GetEmploymentHistoryQuery { CertifiedTechnicianId = id }));

        [HttpPost("qualifications/add")]
        [Produces("application/json")]
        [Authorize("registers:add-qualifications-to-technicians")]
        public async Task<IActionResult> AddNewQualification([FromForm] CreateQualificationCommand request)
        {
            return Ok(await Mediator.Send(request));
        }


        [HttpPost("qualifications/update")]
        [Authorize("registers:edit-certified-technicians")]
        public async Task<IActionResult> EditQualification([FromForm] EditQualificationCommand request)
        {
            return Ok(await Mediator.Send(request));
        }


        [HttpPut("{id}")]
        [Authorize("registers:edit-certified-technicians")]
        public async Task<IActionResult> UpdateCertifiedTechnician([FromRoute] string id, [FromBody] UpdateUserCommand command)
        {
            try
            {
                if (id != command.Id || !command.IsCertifiedTechnician)
                    return BadRequest("Invalid Technician Provided!");
                return Ok(await Mediator.Send(command));
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPost("end-current-employment")]
        public async Task<IActionResult> EndCurrentEmployment()
        {
            return Ok(await Mediator.Send(new EndCurrentEmploymentCommand { TechnicianId = UserId }));
        }

        [HttpPost("{id}/record-employment")]
        public async Task<IActionResult> EndCurrentEmployment([FromRoute] string id, [FromBody] RecordEmploymentDto request)
        {
            try
            {
                return Ok(await Mediator.Send(new StartEmploymentCommand { TechnicianIds = new() { id }, StartDate = request.StartDate }));
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }
    }
}

