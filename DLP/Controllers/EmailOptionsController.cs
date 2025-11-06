using DLP.Application.EmailConfiguration.Commands;
using DLP.Application.EmailConfiguration.DTOs;
using DLP.Application.EmailConfiguration.Queries;
using DLP.Controllers.Shared;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers;

[ApiController]
[Route("email-options")]
public class EmailOptionsController : ApiControllerBase
{

    [HttpGet("active")]
    [Authorize("email-options:edit")]
    public async Task<ActionResult<EmailOptionsDto>> GetEmailOptions()
    {
        var result = await Mediator.Send(new GetActiveEmailOptionsQuery());
        return Ok(result);
    }

    [HttpPut]
    [Authorize("email-options:edit")]
    public async Task<IActionResult> UpdateEmailOptions(UpdateEmailOptionsCommand command)
    {
        await Mediator.Send(command);
        return NoContent();
    }

    [HttpPost]
    [Authorize("email-options:edit")]
    public async Task<IActionResult> CreateNewEmailOptions(CreateNewEmailOptionsCommand command)
    {
        try
        {
            await Mediator.Send(command);
            return NoContent();
        }
        catch (Exception e)
        {

            return BadRequest(e.Message);
        }
    }

    [HttpPost("test-connection")]
    [Authorize("email-options:edit")]
    public async Task<IActionResult> TestSmtpConnection(TestSmtpConnectionCommand command)
    {
        bool isSuccess = await Mediator.Send(command);

        if (isSuccess)
        {
            return Ok(new { success = true, message = "SMTP connection test passed." });
        }
        return BadRequest(new { success = false, message = "SMTP connection test failed." });
    }
}
