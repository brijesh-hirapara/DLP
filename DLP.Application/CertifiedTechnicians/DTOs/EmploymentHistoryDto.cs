using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DLP.Application.Common.DTOs;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Organizations.DTOs;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.CertifiedTechnicians.DTOs
{
    public class EmploymentHistoryDto : IMapFrom<Employment>
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }
        public string CompanyName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        [NotMapped]
        public bool IsPresent => StartDate.HasValue && !EndDate.HasValue;

        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<Employment, EmploymentHistoryDto>()
                .Map(dest => dest.CompanyName, src => src.Company.Name);
        }

    }

}

