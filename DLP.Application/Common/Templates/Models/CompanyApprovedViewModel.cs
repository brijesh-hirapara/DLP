namespace DLP.Application.Common.Templates.Models;

public class CompanyApprovedViewModel
{
    public required string CompanyName { get; set; }
    public required string ContactName { get; set; }
    public required string ContactPersonEmail { get; set; }
    public required string OTPCode { get; set; }
    public required string UserLang { get; set; }
    public required string SiteUrl { get; set; }
}
