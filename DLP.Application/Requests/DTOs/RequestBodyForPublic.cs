using System;
using DLP.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace DLP.Application.Requests.DTOs
{
    public class RequestBodyForPublic
    {
        
        public string IdNumber { get; set; }
        public string? CompanyName { get; set; }
        public string? CompanyEmailAddress { get; set; }
        public string? CompanyPhoneNumber { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? TaxNumber { get; set; }
        public string? ResponsiblePersonFullName { get; set; }
        public string? ResponsiblePersonFunction { get; set; }
        public string? ContactPerson { get; set; }
        public string? ContactPersonEmail { get; set; }
        public string? Address { get; set; }
        public string? Place { get; set; }
        public string? PostCode { get; set; }
        public string? Comments { get; set; }
        public Guid MunicipalityId { get; set; }
        public string? LicenseId { get; set; }
        public DateTime? LicenseDuration { get; set; }
        /// <summary>
        /// Holds one or more certification numbers of certified technicians. Numbers separated by semicolon (;)
        /// </summary>
        public List<string> CertificationNumbers { get; set; } = new();
        public int? TotalNumberOfServiceTechnians { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the company meets the equipment regulations.
        /// </summary>
        public bool MeetsEquipmentRegulations { get; set; }
        public Guid? LanguageId { get; set; }
        public RequestType Type { get; set; }
        public RequestStatus? Status { get; set; }
        public RequestCompanyType? CompanyType { get; set; }
        public AreaOfExpertise? AreaOfExpertise { get; set; }
        public Guid? BusinessActivityId { get; set; }
        public List<IFormFile> Attachments { get; set; } = new();
    }
}

