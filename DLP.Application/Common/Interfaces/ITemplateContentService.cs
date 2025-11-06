namespace DLP.Application.Common.Interfaces;
public interface ITemplateContentService
{
    Task<string> RenderToString<TModel>(string viewName, TModel model);
}