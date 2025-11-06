using DLP.Application.Common.Pagination;
using DLP.Application.CompanyBranches.Commands;
using DLP.Application.CompanyBranches.DTOs;
using DLP.Application.CompanyBranches.Queries;
using DLP.Application.CompanyBranches.Requests;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers;

[ApiController]
[Route("api/company-branches")]
public class CompanyBranchesController : ApiControllerBase

{
    [HttpGet]
    public async Task<ActionResult<OrdinalPaginatedList<CompanyBranchDto>>> GetCompanyBranches([FromQuery] GetCompanyBranchesQuery query)
    {
        var branches = await Mediator.Send(query);

        return branches;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CompanyBranchDto>> GetCompanyBranch(Guid id)
    {
        var query = new GetCompanyBranchQuery { BranchId = id };
        var branch = await Mediator.Send(query);

        if (branch == null)
        {
            return NotFound();
        }

        return branch;
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> CreateCompanyBranch([FromBody] CreateCompanyBranchRequest request)
    {
        try
        {
            if (!OrganizationId.HasValue)
            {
                return BadRequest("Only company users can create company branches");
            }

            var command = new CreateCompanyBranchCommand
            {
                Request = request,
                OrganizationId = OrganizationId.Value,
            };
            var branchId = await Mediator.Send(command);
            return Ok();
        }
        catch (Exception e)
        {

            return BadRequest(e.Message);
        }

    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCompanyBranch(Guid id, UpdateCompanyBranchCommand command)
    {
        try
        {
            if (id != command.BranchId)
            {
                return BadRequest();
            }
            await Mediator.Send(command);

            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
       
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCompanyBranch(Guid id)
    {
        var command = new DeleteCompanyBranchCommand { BranchId = id };
        await Mediator.Send(command);

        return NoContent();
    }
}
