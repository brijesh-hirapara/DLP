using DLP.Application.Common.Pagination;
using DLP.Application.ServiceTechnician.Commands;
using DLP.Application.ServiceTechnician.DTOs;
using DLP.Application.ServiceTechnician.Queries;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceTechnicianReportController : ApiControllerBase
    {

        [HttpGet]
        public async Task<ActionResult<OrdinalPaginatedList<ServiceTechnicianReportDto>>> GetServiceTechnicianReport([FromQuery] GetServiceTechnicianReportQuery query)
        {
            return await Mediator.Send(query);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceTechnicianReportDetailDto>> GetServiceTechnicianReportDetail(Guid id)
        {
            try
            {
                var serviceTechnicianReport = await Mediator.Send(new GetServiceTechnicianReportDetailQuery { Id = id });
                return Ok(serviceTechnicianReport);
            }
            catch (Exception ex)
            {
                // Log the exception if needed
                return NotFound(ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateServiceTechnicianReport([FromBody] CreateServiceTechnicianReportCommand command)
        {
            try
            {
                return Ok(await Mediator.Send(command));
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
            
        }


        [HttpPut]
        public async Task<ActionResult<Guid>> UpdateServiceTechnicianReport([FromBody] UpdateServiceTechnicianReportCommand command)
        {
            try
            {
                return Ok(await Mediator.Send(command));
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
            //await Mediator.Send(command);
            //return NoContent();
            
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteServiceTechnicianReport(Guid id)
        {
            try
            {
                var command = new DeleteServiceTechnicianReportCommand { Id = id };
                return Ok(await Mediator.Send(command));
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
          
        }

        [HttpGet("summary")]
        public async Task<ActionResult<OrdinalPaginatedList<ServiceTechnicianAnnualReportSummaryDto>>> GetServiceTechnicianReportSummary([FromQuery] GetServiceTechnicianReportSummaryQuery query)
        {
            return await Mediator.Send(query);
        }
        [HttpGet("year")]
        public async Task<ActionResult<ServiceTechnicianReportYearDto>> GetServiceTechnicianReportYear([FromQuery] GetServiceTechnicianReportYearQuery query)
        {
            return await Mediator.Send(query);
        }
    }
}
