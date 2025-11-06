namespace DLP.Application.Common.Templates.Models;

public class OTPViewModel
{
    public required string RecipientEmail { get; set; }
    public required string RecipientName { get; set; }
    public required string OTPCode { get; set; }
    public required string UserLang { get; set; }
    public required string SiteUrl { get; set; }
}
