using System;
using DLP.Application.CertifiedTechnicians.DTO;
using DLP.Application.Common.Mappings;
using DLP.Domain.Entities;
using Mapster;

namespace DLP.Application.Equipments.DTOs
{
	public class TechnicianForActivityDto: IMapFrom<User>
	{
		public string Email { get; set; }
		public string FullName { get; set; }
		public string AuthorizedRepairerPhoneNumber { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<User, TechnicianForActivityDto>()
                .Map(dest => dest.FullName, src => src.FullName)
                .Map(dest => dest.Email, src => src.Email)
                .Map(dest => dest.AuthorizedRepairerPhoneNumber, src => src.Organization != null ? src.Organization.PhoneNumber : "");
        }
    }
}

