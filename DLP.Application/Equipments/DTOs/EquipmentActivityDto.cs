using System;
using DLP.Application.Common.DTOs;
using DLP.Application.Common.Mappings;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.Equipments.DTOs
{
    public class EquipmentActivityDto : IMapFrom<EquipmentActivity>
    {
        public Guid Id { get; set; }
        public DateTime? DateOfChange { get; set; }
        public Guid TypeOfChangeId { get; set; }
        public string TypeOfChange { get; set; }
        public string? NewOperatorName { get; set; }
        public Guid? NewCoolantId { get; set; }
        public string NewCoolant { get; set; }
        public string TechnicianCertificateNumber { get; set; }
        public string CreatedById { get; set; }
        public string CreatedBy { get; set; }
        public string SerialNumber { get; set; }
        public string BranchOfficeName { get; set; }
        public string Comments { get; set; }
        public List<FileResultDto> Files { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<EquipmentActivity, EquipmentActivityDto>()
                .Map(dest => dest.TypeOfChange, src => src.TypeOfChange != null ? src.TypeOfChange.Name : "")
                .Map(dest => dest.CreatedBy, src => src.CreatedBy != null ? src.CreatedBy.FullName : "")
                .Map(dest => dest.SerialNumber, src => src.Equipment != null ? src.Equipment.SerialNumber : "")
                .Map(dest => dest.BranchOfficeName, src => src.Equipment != null ? src.Equipment.CompanyBranch.BranchOfficeName : "")
                .Map(dest => dest.NewCoolant, src => src.NewCoolant != null ? src.NewCoolant.Name : "");
        }
    }
}

