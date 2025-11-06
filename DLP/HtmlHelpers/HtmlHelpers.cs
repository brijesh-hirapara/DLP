using DLP.Application.Common.Interfaces;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace DLP.HtmlHelpers;

public static class HtmlHelpers
{
    public static async Task<IHtmlContent> Translate(this IHtmlHelper html, string key, string defaultValue, string languageCode = "bs")
    {
        var httpContext = html.ViewContext.HttpContext;
        var translationService = httpContext.RequestServices.GetRequiredService<ITranslationService>();

        // You would need to implement some method of retrieving the language code
        // For this example, let's assume it's stored in a claim in the User object
        var language = languageCode ?? httpContext.User.FindFirst("language")?.Value ?? "bs";

        var translation = await translationService.Translate(language, key, defaultValue);
        return new HtmlString(translation);
    }
}
