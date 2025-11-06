
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Translations.Commands;
using DLP.Application.Translations.DTOs;
using DLP.Application.Translations.Queries;
using DLP.Controllers.Shared;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers;

public class TranslationsController : ApiControllerBase
{
    [HttpGet("{Language}")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(Dictionary<string, string>), 200)]
    public async Task<IActionResult> GetLanguageTranslations([FromRoute] GetLanguageTranslationsQuery query)
        => Ok(await Mediator.Send(query));

    [HttpGet]
    [Produces("application/json")]
    [Authorize("translations:list")]
    [ProducesResponseType(typeof(List<ActivityLogDto>), 200)]
    public async Task<IActionResult> GetTranslations([FromQuery] GetTranslationsQuery query) => Ok(await Mediator.Send(query));

    [HttpPut("{key}")]
    [Produces("application/json")]
    [Authorize("translations:edit")]
    [ProducesResponseType(typeof(Unit), 200)]
    public async Task<IActionResult> UpdateTranslation([FromRoute] string key, [FromBody] List<TranslationDto> translations)
    {
        return Ok(await Mediator.Send(new UpdateTranslationCommand
        {
            Key = key,
            Translations = translations
        }));
    }

    [HttpPost("{lng}")]
    [Produces("application/json")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(Unit), 200)]
    public async Task<IActionResult> AddTranslation([FromRoute] string lng, [FromBody] Dictionary<string, string> kv)
    {
        return Ok(await Mediator.Send(new AddTranslationCommand
        {
            Language = lng,
            Key = kv.Keys.First(),
            Value = kv.Values.First()
        }));
    }
}