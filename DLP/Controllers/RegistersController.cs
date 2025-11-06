using DLP.Application.Common.Pagination;
using DLP.Application.Registers.DTOs;
using DLP.Application.Registers.Queries;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers;


[ApiController]
public class RegistersController : ApiControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<RegisterDetailsDto>> GetRegisterDetails([FromRoute] Guid id)
    {
        var response = await Mediator.Send(new GetRegisterDetailsQuery
        {
            Id = id
        });
        return Ok(response);
    }

    [HttpGet("companies-count")]
    public async Task<ActionResult<RegisterDetailsDto>> GetRegisterOverView([FromRoute] Guid entityId)
    {
        var response = await Mediator.Send(new GetRegisterOverviewQuery
        {
            EntityId = entityId
        });
        return Ok(response);
    }
    [HttpGet("companies-entrepreneurs")]
    public async Task<ActionResult<OrdinalPaginatedList<CompanyEntrepreneurDto>>> GetAllRegisteredCompaniesEntrepreneurs([FromQuery] GetCompaniesEnterprenuersQuery query)
    {
        var response = await Mediator.Send(query);
        return Ok(response);
    }

    [HttpGet("owners-operators")]
    public async Task<ActionResult<OrdinalPaginatedList<OwnerOperatorOfEquipmentDto>>> GetOwnersAndOperators([FromQuery] GetOwnersOperatorsOfEquipmentsQuery query)
    {
        var response = await Mediator.Send(query);
        return Ok(response);
    }

    [HttpGet("dlp-service-companies")]
    public async Task<ActionResult<OrdinalPaginatedList<KGHServiceCompanyDto>>> GetKGHServiceCompanies([FromQuery] GetKGHServiceCompaniesQuery query)
    {
        var response = await Mediator.Send(query);
        return Ok(response);
    }

    [HttpGet("importers-exporters")]
    public async Task<ActionResult<OrdinalPaginatedList<ImporterExporterCompanyDto>>> GetImportersExporters([FromQuery] GetImportersExportersCompaniesQuery query)
    {
        var response = await Mediator.Send(query);
        return Ok(response);
    }

    [HttpGet("marked-equipments")]
    public async Task<ActionResult<OrdinalPaginatedList<MarkedEquipmentDto>>> GetMarkedEquipments([FromQuery] GetMarkedEquipmentsQuery query)
    {
        var response = await Mediator.Send(query);
        return Ok(response);
    }
}
