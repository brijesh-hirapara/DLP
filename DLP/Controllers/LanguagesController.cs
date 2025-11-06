using DLP.Application.Authentication.Login;
using DLP.Application.Common.Interfaces;
using DLP.Application.Languages.Commands;
using DLP.Application.Languages.DTOs;
using DLP.Application.Languages.Queries;
using DLP.Application.OtherContexts;
using DLP.Application.Translations.Commands;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers;

[AllowAnonymous]
public class LanguagesController : ApiControllerBase
{
    private readonly IConfiguration _configuration;

    public LanguagesController(
      IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost]
    [Authorize("languages:add")]
    public async Task<IActionResult> AddLanguage([FromBody] AddLanguageCommand command)
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
    [HttpPut("{id}")]
    [Authorize("languages:edit")]
    public async Task<IActionResult> UpdateLanguage([FromRoute] Guid id, [FromBody] UpdateLanguageCommand command)
    {
        command.Id = id;
        return Ok(await Mediator.Send(command));
    }

    [HttpDelete("{id}")]
    [Authorize("languages:delete")]
    public async Task<IActionResult> DeleteLanguage([FromRoute] Guid id)
    {
        try
        {
            return Ok(await Mediator.Send(new DeleteLanguageCommand { Id = id }));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet]
    [Produces("application/json")]
    [Authorize("languages:list")]
    [ProducesResponseType(typeof(List<LanguageDto>), 200)]
    public async Task<IActionResult> GetLanguagesQuery([FromQuery] GetLanguagesQuery query)
        => Ok(await Mediator.Send(query));

    [HttpGet("for-ui")]
    [Produces("application/json")]
    [Authorize("languages:list")]
    [ProducesResponseType(typeof(List<LanguageForUiDto>), 200)]
    public async Task<IActionResult> GetLanguagesForUi([FromQuery] GetAllLanguagesForUiQuery query)
        => Ok(await Mediator.Send(query));


    [HttpGet("i18n-codes")]
    [Produces("application/json")]
    [Authorize("languages:list")]
    [ProducesResponseType(typeof(List<I18nLanguageCodeDto>), 200)]
    public async Task<IActionResult> GetI18nLanguageCodesHandler([FromQuery] GetI18nLanguageCodes query)
        => Ok(await Mediator.Send(query));


    [HttpGet("i18n-codes-for-instance")]
    public async Task<ActionResult> GetI18nLanguageCodesForInstance()
    {
        try
        {
            var code = _configuration["LanguageConstants:LanguageCodeForInstance"];
            var instance = _configuration["LanguageConstants:Instance"];

            var response = new
            {
                LanguageCodeForInstance = code,
                Instance = instance
            };

            return Ok(response);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}
