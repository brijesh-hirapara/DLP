namespace DLP.Application.Requests.DTOs;

public class ApproveRequestDto
{
    public string? LicenseId { get; set; }
    public DateTime? LicenseDuration { get; set; }
    public string? Comments { get; set; }
}
