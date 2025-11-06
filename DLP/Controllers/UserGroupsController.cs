using DLP.Application.Languages.Queries;
using DLP.Application.UserGroups.Commands;
using DLP.Application.UserGroups.DTOs;
using DLP.Application.UserGroups.Queries;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Web;

namespace dlp.Controllers;

[Route("user-groups")]
public class UserGroupsController : ApiControllerBase
{
    [HttpGet]
    [Authorize("user-groups:list")]
    public async Task<ActionResult<List<GroupOverviewDto>>> GetUserGroups([FromQuery] GetUserGroupsQuery query)
    {
        //var query = new GetUserGroupsQuery();
        return Ok(await Mediator.Send(query));
    }

    [HttpPost]
    [Authorize("user-groups:add")]
    public async Task<IActionResult> AddUserGroup([FromBody] AddUserGroupCommand command)
    {
        command.AccessLevel ??= AccessLevel;
        return Ok(await Mediator.Send(command));
    }

    [HttpGet("{name}")]
    [Authorize("user-groups:edit")]
    public async Task<ActionResult<UserGroupDetailsDto>> GetUserGroupDetails([FromRoute] string name)
    {
        var query = new GetUserGroupDetailsQuery { RoleName = HttpUtility.UrlDecode(name) };
        return Ok(await Mediator.Send(query));
    }

    [HttpPut]
    [Authorize("user-groups:edit")]
    public async Task<IActionResult> EditUserGroup([FromBody] EditUserGroupCommand command)
    {
        try
        {
            return Ok(await Mediator.Send(command));
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
      

    [HttpDelete("{name}")]
    [Authorize("user-groups:deactivate")]
    public async Task<IActionResult> DeleteUserGroup([FromRoute] string name)
    {
        return Ok(await Mediator.Send(new DeleteUserGroupCommand { Name = name }));
    }

    [HttpGet("available/{name}")]
    [Authorize("user-groups:add")]
    public async Task<ActionResult<bool>> UserGroupIsAvailable([FromRoute] string name)
    {
        return Ok(await Mediator.Send(new GetUserGroupAvailabilityQuery { Name = name }));
    }
}
