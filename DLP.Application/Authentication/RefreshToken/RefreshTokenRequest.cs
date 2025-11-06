namespace DLP.Application.Authentication.RefreshToken;

public class RefreshTokenRequest
{
    public required string AccessToken { get; set; }
    public bool RememberMe { get; set; }
}
