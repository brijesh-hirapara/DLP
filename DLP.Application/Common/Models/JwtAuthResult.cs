namespace DLP.Application.Common.Models;
public class JwtAuthResult
{
    public string AccessToken { get; set; }
    public RefreshTokenResult RefreshToken { get; set; }
}
