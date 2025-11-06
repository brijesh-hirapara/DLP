using System;
namespace DLP.Application.Registers.DTOs
{
    public class RegisterForPublicDto
    {
        public Guid Id { get; set; }
        public string? CompanyName { get; set; }
        public string? Municipality { get; set; }
        public string? CompanyType { get; set; }
        public string? StatusDesc { get; set; }
        public int? NrOfCertifiedServiceTechnicians { get; set; }
        public string? LicenseId { get; set; }
        public int? NrOfBranches { get; set; }
        public int? NrOfEquipments { get; set; }
        public DateTime? LicenseDuration { get; set; }
    }
}

