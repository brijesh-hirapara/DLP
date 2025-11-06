using DLP.Application.Common.Interfaces;
using Razor.Templating.Core;
namespace DLP.Services;

public class TemplateContentService : ITemplateContentService
{
    public Task<string> RenderToString<TModel>(string viewName, TModel model)
    {
        return RazorTemplateEngine.RenderAsync($"/Templates/{viewName}", model);
    }
}