namespace DLP.Application.Authentication.Login;

public class LoginResponse
{
    public string UserName { get; set; }
    public string Role { get; set; }
    public string AccessToken { get; set; }
    public long ExpiresIn { get; set; }
    public bool RememberMe { get; set; }
    public bool ShouldShowOnboarding { get; set; }
    public string? ProfileImage { get; set; }
}
