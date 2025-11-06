namespace DLP.Application.Common.Templates.Models;

public class RequestApprovedViewModel
{
    public required string RequestId { get; set; }
    public required string ContactName { get; set; }
    public required string ContactPersonEmail { get; set; }
    public required string UserLang { get; set; }
    public required string RequestType { get; set; }
}
