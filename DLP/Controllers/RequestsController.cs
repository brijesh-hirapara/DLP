using DLP.Application.Common.Pagination;
using DLP.Application.Qualifications.DTOs;
using DLP.Application.Qualifications.Queries;
using DLP.Application.Requests.Commands;
using DLP.Application.Requests.DTOs;
using DLP.Application.Requests.Queries;
using DLP.Application.Users.Queries;
using DLP.Controllers.Shared;
using DLP.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers;

[ApiController]
public class RequestsController : ApiControllerBase
{
    [HttpGet]
    [Produces("application/json")]
    //[Authorize("requests:list")]
    //[MVTEOEligible]
    public async Task<ActionResult<PaginatedList<ListRequestDto>>> GetRequests([FromQuery] GetRequestsQuery query)
        => Ok(await Mediator.Send(query));

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<RequestDetailsDto>> GetRequestDetails([FromRoute] Guid id)
        => Ok(await Mediator.Send(new GetRequestDetailsQuery { Id = id }));

    [HttpGet("download/{fileId}")]
    [Produces(typeof(FileContentResult))]
    public async Task<IActionResult> DownloadFile([FromRoute] Guid fileId)
    {
        try
        {
            var fileResult = await Mediator.Send(new GetRequestFileQuery
            {
                FileId = fileId,
                CurrentUserAccessLevel = AccessLevel,
                CurrentUserCompanyId = OrganizationId,
            });

            return File(fileResult.FileContents, fileResult.ContentType, fileResult.FileName);
        }
        catch (FileNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateRequest([FromForm] CreateRequestCommand command)
    {
        try
        {
            command.CurrentUserId = UserId;
            command.IsLoggedInAsCompany = AccessLevel == AccessLevelType.Company;
            if (command.IsLoggedInAsCompany && command.CompanyId.HasValue && command.CompanyId != OrganizationId)
            {
                return Forbid("You are not authorized to make this request");
            }

            var isEmailAvailable = command.IsLoggedInAsCompany
                ? true
                : await Mediator.Send(new GetEmailAvailabilityQuery { Email = command.ContactPersonEmail });
            if (!isEmailAvailable)
            {
                return BadRequest($"Email {command.ContactPersonEmail} is not available");
            }

            await Mediator.Send(command);
            return Ok();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpPost("Import")]
    [AllowAnonymous]
    public async Task<IActionResult> ImportRequest([FromForm] ImportRequestCommand command)
    {
        try
        {
            //command.CurrentUserId = UserId;
            //command.IsLoggedInAsCompany = AccessLevel == AccessLevelType.Company;
            //if (command.IsLoggedInAsCompany && command.CompanyId.HasValue && command.CompanyId != OrganizationId)
            //{
            //    return Forbid("You are not authorized to make this request");
            //}

            //var isEmailAvailable = command.IsLoggedInAsCompany
            //    ? true
            //    : await Mediator.Send(new GetEmailAvailabilityQuery { Email = command.ContactPersonEmail });
            //if (!isEmailAvailable)
            //{
            //    return BadRequest($"Email {command.ContactPersonEmail} is not available");
            //}

            var response =await Mediator.Send(command);
            return Ok(response);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    } 
    
    
    [HttpPost("ImportServiceCampany")]
    [AllowAnonymous]
    public async Task<IActionResult> ImportServiceRequest([FromForm] ImportServiceCompanyCommand command)
    {
        try
        {
            //command.CurrentUserId = UserId;
            //command.IsLoggedInAsCompany = AccessLevel == AccessLevelType.Company;
            //if (command.IsLoggedInAsCompany && command.CompanyId.HasValue && command.CompanyId != OrganizationId)
            //{
            //    return Forbid("You are not authorized to make this request");
            //}

            //var isEmailAvailable = command.IsLoggedInAsCompany
            //    ? true
            //    : await Mediator.Send(new GetEmailAvailabilityQuery { Email = command.ContactPersonEmail });
            //if (!isEmailAvailable)
            //{
            //    return BadRequest($"Email {command.ContactPersonEmail} is not available");
            //}
            var response =await Mediator.Send(command);
            return Ok(response);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    
    [HttpPost("ImportServiceTecniciansRequest")]
    [AllowAnonymous]
    public async Task<IActionResult> ImportServiceTecniciansRequest([FromForm] ImportServiceCompanyCommand command)
    {
        try
        {
            //command.CurrentUserId = UserId;
            //command.IsLoggedInAsCompany = AccessLevel == AccessLevelType.Company;
            //if (command.IsLoggedInAsCompany && command.CompanyId.HasValue && command.CompanyId != OrganizationId)
            //{
            //    return Forbid("You are not authorized to make this request");
            //}

            //var isEmailAvailable = command.IsLoggedInAsCompany
            //    ? true
            //    : await Mediator.Send(new GetEmailAvailabilityQuery { Email = command.ContactPersonEmail });
            //if (!isEmailAvailable)
            //{
            //    return BadRequest($"Email {command.ContactPersonEmail} is not available");
            //}
            var response =await Mediator.Send(command);
            return Ok(response);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPut("{id}/approve")]
    public async Task<IActionResult> ApproveRequest([FromRoute] Guid id, [FromBody] ApproveRequestDto request)
    {
        try
        {
            await Mediator.Send(new ApproveRequestCommand
            {
                CurrentUserId = UserId,
                RequestId = id,
                LicenseId = request.LicenseId,
                LicenseDuration = request.LicenseDuration,
                Comments = request.Comments
            });
            return Ok();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPut("{id}/reject")]
    public async Task<IActionResult> RejectRequest([FromRoute] Guid id, [FromBody] string comments)
    {
        await Mediator.Send(new RejectRequestCommand
        {
            CurrentUserId = UserId,
            RequestId = id,
            Comments = comments
        });
        return Ok();
    }

    [HttpPost("certificate-numbers-validity")]
    public async Task<ActionResult<List<CertificateNumberAvailabilityResult>>> CheckCertificateNumbersValidity([FromBody] CheckCertificateNumberAvailabilityQuery query) => Ok(await Mediator.Send(query));
}
