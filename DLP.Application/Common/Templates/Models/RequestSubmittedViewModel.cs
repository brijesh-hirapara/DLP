namespace DLP.Application.Common.Templates.Models;

public class RequestSubmittedViewModel
{
    public required string RequestId { get; set; }
    public required string ContactName { get; set; }
    public required string ContactPersonEmail { get; set; }
    public required string UserLang { get; set; }
}
