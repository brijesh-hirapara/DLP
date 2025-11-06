namespace DLP.Application.Common.Templates.Models;

public class ForgotPasswordViewModel
{
    public required string Email { get; set; }
    public required string UserLang { get; set; }
    public required string TokenUrl { get; set; }
}
