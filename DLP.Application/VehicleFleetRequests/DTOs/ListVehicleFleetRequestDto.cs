using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Requests.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.VehicleFleetRequests.DTOs
{
    public class ListVehicleFleetRequestDto : IMapFrom<VehicleFleetRequest>, IOrdinalNumber
    {
        public Guid Id { get; set; }
        public int OrdinalNumber { get; set; }
        public string Name { get; set; }        
        public int TotalVehicle { get; set; }        
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ActionedAt { get; set; }
        public VehicleFleetRequestStatus Status { get; set; }
        public string StatusText { get; set; }
        public string? Comments { get; set; }
        //public string? Status { get; set; }

        public void Mapping(TypeAdapterConfig config)
        {
            config.ForType<VehicleFleetRequest, ListVehicleFleetRequestDto>()
               .Map(dest => dest.Comments, src => src.Comments)
               .Map(dest => dest.Status, src => src.Status);
        }
    }
}
