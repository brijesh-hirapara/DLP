using DLP.Application.Common.Pagination;
using DLP.Application.Organizations.Commands;
using DLP.Application.Organizations.DTOs;
using DLP.Application.Organizations.Queries;
using DLP.Application.Organizations.Requests;
using DLP.Application.Users.Queries;
using DLP.Controllers.Shared;
using DLP.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers;

[ApiController]
public class OrganizationsController : ApiControllerBase
{
    [HttpPost]
    public async Task<IActionResult> AddOrganization([FromBody] OrganizationRequest request)
    {
        var isEmailAvailable = await Mediator.Send(new GetEmailAvailabilityQuery { Email = request.Email });
        if (!isEmailAvailable)
        {
            return BadRequest($"Email {request.Email} is not available");
        }

        var isContactPersonEmailAvailable = await Mediator.Send(new GetEmailAvailabilityQuery { Email = request.ContactPersonEmail });
        if (!isContactPersonEmailAvailable)
        {
            return BadRequest($"Contact person email {request.ContactPersonEmail} is not available");
        }

        var model = new AddOrganizationCommand
        {
            Organization = request,
            CreatedById = UserId,
        };
        await Mediator.Send(model);
        return Ok();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOrganization([FromRoute] Guid id, [FromBody] OrganizationRequest request)
    {
        var model = new UpdateOrganizationCommand
        {
            Organization = request,
            UpdatedById = UserId,
            OrganizationId = id
        };
        await Mediator.Send(model);
        return Ok();
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateOrganizationStatus([FromRoute] Guid id, [FromBody] OrganizationStatus status)
    {
        var model = new ChangeOrganizationStatusCommand
        {
            OrganizationId = id,
            Status = status
        };
        await Mediator.Send(model);
        return Ok();
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedList<OrganizationDto>>> GetOrganizations([FromQuery] GetOrganizationsQuery query)
    {
        var organizations = await Mediator.Send(query);
        return Ok(organizations);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrganizationDto>> GetOrganizationDetails([FromRoute] Guid id)
    {
        var query = new GetOrganizationDetailsQuery { OrganizationId = id };
        var organization = await Mediator.Send(query);
        return Ok(organization);
    }

    [HttpGet("id-number/{idNumber}")]
    public async Task<ActionResult<OrganizationDto>> GetOrganizationDetails([FromRoute] string idNumber)
    {
        var organization = await Mediator.Send(new GetOrganizationByIdNumber
        {
            IdNumber = idNumber,
        });
        return Ok(organization);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrganization([FromRoute] Guid id)
    {
        var command = new DeleteOrganizationCommand { OrganizationId = id };
        await Mediator.Send(command);
        return NoContent();
    }
}
