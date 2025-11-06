
using DLP.Application.Common.Pagination;
using DLP.Application.Reports.DTOs;
using DLP.Application.Reports.Queries;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ApiControllerBase
    {
        [HttpGet("technicians-by-training-center")]
        public async Task<ActionResult<OrdinalPaginatedList<ReportResponseDto<Guid>>>> GetTechniciansByTrainingCenter([FromQuery] ReportRequestDto request)
        {
            try
            {
                var result = await Mediator.Send(new GetTotalCertifiedTechniciansByTrainingCenterQuery() { From = request.From, To = request.To, PageNumber = request.PageNumber, PageSize = request.PageSize });
                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error. Please try again later.");
            }
        }

        [HttpGet("technicians-by-qualifications")]
        public async Task<ActionResult<OrdinalPaginatedList<ReportResponseDto<Guid>>>> GetTechniciansByQualifications([FromQuery] ReportRequestDto request)
        {
            try
            {
                var result = await Mediator.Send(new GetTotalCertifiedTechniciansByQualificationQuery() { From = request.From, To = request.To, PageNumber = request.PageNumber, PageSize = request.PageSize });
                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error. Please try again later.");
            }
        }

        [HttpGet("technicians-by-entity")]
        public async Task<ActionResult<OrdinalPaginatedList<ReportResponseDto<Guid>>>> GetTechniciansByEntity([FromQuery] ReportRequestDto request)
        {
            try
            {
                var result = await Mediator.Send(new GetTotalCertifiedTechniciansByEntityQuery() { From = request.From, To = request.To, PageNumber = request.PageNumber, PageSize = request.PageSize });
                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error. Please try again later.");
            }
        }

        [HttpGet("equipments-by-municipality")]
        public async Task<ActionResult<OrdinalPaginatedList<ReportResponseDto<int>>>> GetEquipmentsByMunicipality([FromQuery] ReportRequestDto request)
        {
            try
            {
                var result = await Mediator.Send(new GetTotalEquipmentByMunicipalityQuery() { From = request.From, To = request.To, PageNumber = request.PageNumber, PageSize = request.PageSize });
                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error. Please try again later.");
            }
        }


        [HttpGet("equipments-by-purpose")]
        public async Task<ActionResult<OrdinalPaginatedList<ReportResponseDto<int>>>> GetEquipmentByPurpose([FromQuery] ReportRequestDto request)
        {
            try
            {
                var result = await Mediator.Send(new GetTotalEquipmentByPurposeQuery() { From = request.From, To = request.To, PageNumber = request.PageNumber, PageSize = request.PageSize });
                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error. Please try again later.");
            }
        }

        [HttpGet("equipments-by-cooling-system")]
        public async Task<ActionResult<OrdinalPaginatedList<ReportResponseDto<int>>>> GetEquipmentByCoolingSystem([FromQuery] ReportRequestDto request)
        {
            try
            {
                var result = await Mediator.Send(new GetTotalEquipmentByCoolingSystemQuery() { From = request.From, To = request.To, PageNumber = request.PageNumber, PageSize = request.PageSize });
                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error. Please try again later.");
            }
        }

        [HttpGet("companies-by-entity")]
        public async Task<ActionResult<OrdinalPaginatedList<CompanyByEntityReportDto>>> GetCompaniesByEntity([FromQuery] ReportRequestDto request)
        {
            try
            {
                var result = await Mediator.Send(new GetTotalCompaniesByEntityQuery() { From = request.From, To = request.To, PageNumber = request.PageNumber, PageSize = request.PageSize });
                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error. Please try again later.");
            }
        }

        [HttpGet("service-companies")]
        public async Task<ActionResult<OrdinalPaginatedList<CompanyByEntityReportDto>>> GetServiceCompaniesByEntity([FromQuery] ReportRequestDto request)
        {
            try
            {
                var result = await Mediator.Send(new GetServiceCompaniesByEntityQuery() { From = request.From ?? DateTime.Now.AddDays(-365), To = request.To ?? DateTime.Now, PageNumber = request.PageNumber, PageSize = request.PageSize });
                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error. Please try again later.");
            }
        }

        [HttpGet("refrigerants-by-entity")]
        public async Task<ActionResult<OrdinalPaginatedList<CompanyByEntityReportDto>>> GetRefrigerantsByEntity([FromQuery] ReportRequestDto request)
        {
            try
            {
                var result = await Mediator.Send(new GetRefrigerantQuantityByTypeAndStateEntityQuery() { From = request.From, To = request.To, PageNumber = request.PageNumber, PageSize = request.PageSize });
                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error. Please try again later.");
            }
        }
    }
}

