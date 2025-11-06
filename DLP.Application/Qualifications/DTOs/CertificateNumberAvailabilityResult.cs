namespace DLP.Application.Qualifications.DTOs;

public class CertificateNumberAvailabilityResult
{
    public string? CertificateNumber { get; set; }
    public string? CertifiedTechnicianFullName { get; set; }
    public bool IsAvailable { get; set; }
}
