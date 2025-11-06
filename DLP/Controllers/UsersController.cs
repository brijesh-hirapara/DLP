using DocumentFormat.OpenXml.Office2010.Excel;
using DLP.Application.Common.Pagination;
using DLP.Application.Users.Commands;
using DLP.Application.Users.DTO;
using DLP.Application.Users.DTOs;
using DLP.Application.Users.Queries;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers;

[Route("users")]
public class UsersController : ApiControllerBase
{
    [HttpGet("list")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(PaginatedList<UserDto>), 200)]
    [Authorize("users:list")]
    //[MVTEOEligible]
    public async Task<IActionResult> GetUsers([FromQuery] GetUsersQuery query)
        => Ok(await Mediator.Send(query));


    [HttpPost]
    [Authorize("users:add")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateUser([FromForm] CreateUserCommand command)
    {
        command.CreatedById = UserId;
        command.OrganizationId = command.OrganizationId.HasValue ? command.OrganizationId : OrganizationId;
        return Ok(await Mediator.Send(command));
    }

    [HttpPut("{id}")]
    [Authorize("users:edit")]
    public async Task<IActionResult> UpdateUser([FromRoute] string id,[FromForm] UpdateUserCommand command)
    {
        command.Id = id;
        return Ok(await Mediator.Send(command));
    }

    [HttpPost("user-groups")]
    [Authorize("user-groups:add-user")]
    public async Task<IActionResult> AddUserToGroup([FromBody] AddUserToGroupCommand command)
    {
        return Ok(await Mediator.Send(command));
    }

    [HttpPut("{id}/toogle")]
    //[Authorize("users:activate")]
    public async Task<IActionResult> ToggleUserActivate([FromRoute] string id, [FromBody] ToggleUserActivateCommand command)
    {
        try
        {
            command.UserId = id;
            return Ok(await Mediator.Send(command));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
       
    }

    [HttpPost("set-new-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] SetNewPasswordRequest request)
    {
        try
        {
            return Ok(await Mediator.Send(new SetNewPasswordCommand
            {
                ConfirmPassword = request.ConfirmPassword,
                Password = request.Password,
                CurrentPassword = request.CurrentPassword,
                UserName = Email,
            }));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }



    [HttpGet("{id}")]
    [Produces("application/json")]
    public async Task<ActionResult<UserDto>> GetUser([FromRoute] string id)
    {
        try
        {
            return Ok(await Mediator.Send(new GetUserQuery { UserId = id }));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
        
    }
    [HttpPost("{id}/resend-confirmation")]
    //[Authorize("users:list")]
    public async Task<IActionResult> ResendConfirmationEmail([FromRoute] string id)
    {
        try
        {
            await Mediator.Send(new ResendEmailConfirmationCommand { Id = id });
            return Ok();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
  
    }
    [HttpPost("not-confirm-users")]
    //[Authorize("not-confirm-users")]
    public async Task<IActionResult> NotConfirmUsersEmail()
    {
        try
        {
            await Mediator.Send(new NotConfirmUsersEmailCommand());
            return Ok();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }

    }
    [HttpGet("me")]
    [Produces("application/json")]
    public async Task<ActionResult<UserDto>> Profile()
        => Ok(await Mediator.Send(new GetUserQuery { UserId = UserId }));

    [HttpPut("me")]
    [Produces("application/json")]
    public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileCommand command)
    {
        try
        {
            //command.Id = UserId;
            return Ok(await Mediator.Send(command));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
        
    }

    [HttpGet("available/{email}")]
    // [Authorize("users:add")]
    // [Authorize("registers:add-certified-technicians")]
    public async Task<ActionResult<bool>> EmailIsAvailable([FromRoute] string email)
    {
        return Ok(await Mediator.Send(new GetEmailAvailabilityQuery { Email = email }));
    }

    [HttpDelete("{id}")]
    [Authorize("users:delete")]
    public async Task<IActionResult> DeleteUser([FromRoute] string id, [FromBody] bool isHardDelete)
    {
        return Ok(await Mediator.Send(new DeleteUserCommand { UserId = id, IsHardDelete = isHardDelete }));
    }

    [HttpPut("{id}/toogle-delete")]
    //[Authorize("users:delete")]
    public async Task<IActionResult> ToggleUserDelete([FromRoute] string id, [FromBody] ToggleUserDeleteCommand command)
    {
        try
        {
            command.UserId = id;
            return Ok(await Mediator.Send(command));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPut("set-default-language")]
    [Produces("application/json")]
    public async Task<IActionResult> SetDefaultLanguage([FromBody] UpdateLanguageRequest command)
    {

        try
        {
            return Ok(await Mediator.Send(new UpdateDefaultLanguageCommand
            {
                UserId = UserId,
                LanguageId = command.LanguageId
            }));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
       
    }

    //[HttpGet("remove-users")]
    //[AllowAnonymous]
    //public async Task<ActionResult> DeleteUsers()
    //{
    //    var usersToDelete = UserManager.Users.Where(x => x.Email != "admin@test.com").ToList();
    //    foreach(var user in usersToDelete)
    //    {
    //        await UserManager.DeleteAsync(user);
    //    }
    //    return Ok();
    //}
}
