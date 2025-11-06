using DLP.Application.Common.Pagination;
using DLP.Application.ImportExportSubstances.Commands;
using DLP.Application.ImportExportSubstances.DTOs;
using DLP.Application.ImportExportSubstances.Queries;
using DLP.Application.ServiceTechnician.DTOs;
using DLP.Application.ServiceTechnician.Queries;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImportExportSubstancesReportController : ApiControllerBase
    {

        [HttpGet]
        public async Task<ActionResult<OrdinalPaginatedList<ImportExportSubstancesReportDto>>> GetImportExportSubstancesReport([FromQuery] GetImportExportSubstancesReportQuery query)
        {
            return await Mediator.Send(query);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ImportExportSubstancesReportDetailDto>> GetImportExportSubstancesReportDetail(Guid id)
        {
            try
            {
                var serviceTechnicianReport = await Mediator.Send(new GetImportExportSubstancesReportDetailQuery { Id = id });
                return Ok(serviceTechnicianReport);
            }
            catch (Exception ex)
            {
                // Log the exception if needed
                return NotFound(ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateImportExportSubstancesReport([FromBody] CreateImportExportSubstancesReportCommand command)
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
        public async Task<ActionResult<Guid>> UpdateImportExportSubstancesReport([FromBody] UpdateImportExportSubstancesReportCommand command)
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


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteImportExportSubstancesReport(Guid id)
        {
            var command = new DeleteImportExportSubstancesReportCommand { Id = id };
            return Ok(await Mediator.Send(command));
        }

        [HttpGet("summary")]
        public async Task<ActionResult<OrdinalPaginatedList<ImportExportSubstancesReportSummaryDto>>> GeImportExportSubstancesReportSummary([FromQuery] GeImportExportSubstancesReportSummaryQuery query)
        {
            return await Mediator.Send(query);
        }
        [HttpGet("year")]
        public async Task<ActionResult<ImportExportSubstancesReportYearDto>> GetImportExportSubstancesReportYear([FromQuery] GetImportExportSubstancesReportYearQuery query)
        {
            return await Mediator.Send(query);
        }
    }
}
