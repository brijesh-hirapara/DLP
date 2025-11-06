namespace DLP.Application.Users.DTOs;
public class SetNewPasswordRequest
{
    public required string CurrentPassword { get; set; }
    public required string Password { get; set; }
    public required string ConfirmPassword { get; set; }

}
