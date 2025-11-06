using DLP.Application.ActivityLogs.Commands;
using DLP.Application.Authentication.ForgotPassword;
using DLP.Application.Authentication.Login;
using DLP.Application.Authentication.Logout;
using DLP.Application.Authentication.Profile.Commands;
using DLP.Application.Authentication.Profile.DTOs;
using DLP.Application.Authentication.Profile.Queries;
using DLP.Application.Authentication.RefreshToken;
using DLP.Application.Authentication.Register;
using DLP.Application.Authentication.ResetPassword;
using DLP.Application.Common.Constants;
using DLP.Controllers.Shared;
using DLP.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace DLP.Controllers;
public class AuthController : ApiControllerBase
{

    [AllowAnonymous]
    [HttpPost("login")]
    [Produces(typeof(LoginResponse))]
    public async Task<ActionResult> Login([FromBody] LoginCommand command)
    {
        try
        {
            var response = await Mediator.Send(command);
            return Ok(response);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterCommand command)
    {
        return Ok(await Mediator.Send(command));
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        try
        {

            await Mediator.Send(new LogoutCommand()
            {
                AccessToken = GetAccessToken()
            });

            await Mediator.Send(new LogActivityCommand
            {
                UserId = UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = ActivityType.USER_LOGGED_OUT
            });

            return Ok();
        }
        catch (SecurityTokenException e)
        {
            return Unauthorized(e.Message);
        }
    }

    [HttpPost("refresh-token")]
    [Produces(typeof(LoginResponse))]
    public async Task<ActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            return Ok(await Mediator.Send(new RefreshTokenCommand()
            {
                AccessToken = request.AccessToken,
                RememberMe = request.RememberMe,
            }));
        }
        catch (SecurityTokenException e)
        {
            return Unauthorized(e.Message);
        }
    }

    [HttpGet("profile")]
    [Authorize("profile:edit")]
    [Produces(typeof(AccountProfileDto))]
    public async Task<ActionResult> GetProfileDetails()
    {
        var query = new GetUserProfileQuery
        {
            UserId = UserId
        };
        return Ok(await Mediator.Send(query));
    }

    [HttpPut("profile")]
    [Authorize("profile:edit")]
    public async Task<ActionResult> UpdateProfile([FromBody] UpdateUserProfileCommand command)
    {
        command.UserId = UserId;
        return Ok(await Mediator.Send(command));
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
    {
        try
        {
            await Mediator.Send(command);
            return Ok();
        }
        catch (Exception e)
        {

            return BadRequest(e.Message);
        }
        
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        return Ok(await Mediator.Send(command));
    }
}