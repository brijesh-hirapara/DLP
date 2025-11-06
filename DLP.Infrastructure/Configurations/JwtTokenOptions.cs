namespace DLP.Infrastructure.Configurations;

public class JwtTokenOptions
{
    public string Secret { get; set; }
    public string Issuer { get; set; }
    public string Audience { get; set; }
    public double AccessTokenExpirationInDays { get; set; } = 1;
    public double RememberMeAccessTokenExpirationInDays { get; set; } = 7;
    public double RefreshTokenExpirationInDays { get; set; }
}