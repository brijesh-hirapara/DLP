using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace DLP.Application.CertifiedTechnicians.DTOs
{
        public class CreateCertifiedTechnicianDto
        {
                public string FirstName { get; set; }
                public string LastName { get; set; }
                public string Email { get; set; }
                public Guid LanguageId { get; set; }
                public Guid OrganizationId { get; set; }
                public DateTime DateOfExam { get; set; }
                public string CertificateNumber { get; set; }
                public DateTime CertificateDuration { get; set; }
                public Guid QualificationTypeId { get; set; }
                public string Comments { get; set; }
                public List<IFormFile> Files { get; set; }
        }
}

