namespace DLP.Application.Common.Templates.Models;

public class NewRequestAddedViewModel
{
    public string RequestId { get; set; }
    public required string RequestDetailsSiteUrl { get; set; }
    public required string[] RecipientEmails { get; set; }
}
