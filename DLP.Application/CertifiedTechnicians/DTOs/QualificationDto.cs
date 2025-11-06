using System;
using System.ComponentModel.DataAnnotations;
using DLP.Application.Common.DTOs;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using Mapster;
using Microsoft.AspNetCore.Http;

namespace DLP.Application.CertifiedTechnicians.DTOs
{
    public class QualificationDto : IMapFrom<Qualification>
    {
        public int OrdinalNumber { get; set; }
        public Guid Id { get; set; }
        public string CertifiedTechnicianId { get; set; }
        public DateTime DateOfExam { get; set; }
        public string CertificateNumber { get; set; }
        public DateTime CertificateDuration { get; set; }
        public Guid QualificationTypeId { get; set; }
        public string QualificationType { get; set; }
        public Guid TrainingCenterId { get; set; }
        public bool Valid { get; set; }
        public bool Locked { get; set; }
        public string TrainingCenter { get; set; }
        public string TechnicianEmail { get; set; }
        public string TechnicianName { get; set; }
        public DateTime? CreatedAt { get; set; }
        public List<FileResultDto> QualificationFiles { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<Qualification, QualificationDto>()
                .Map(dest => dest.QualificationType, src => src.QualificationType.Name)
                .Map(dest => dest.TrainingCenter, src => src.TrainingCenter.Name)
                .Map(dest => dest.TechnicianEmail, src => src.CertifiedTechnician.Email)
                .Map(dest => dest.TechnicianName, src => src.CertifiedTechnician.FirstName + " " + src.CertifiedTechnician.LastName)
                .Ignore(r => r.QualificationFiles)
                .Ignore(r => r.OrdinalNumber);
        }

    }

}

