using DLP.Application.Requests.DTOs;
using DLP.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.VehicleFleetRequests.DTOs
{
    public class VehicleFleetRequestDetailDto
    {
        public Guid Id { get; set; }
        public VehicleFleetRequestStatus Status { get; set; }
        public string StatusText { get; set; }
        public string? Comments { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedById { get; set; }
        public DateTime? ActionedAt { get; set; }
        public string? ActionedBy { get; set; }
        public string? ActionedName { get; set; }
        public List<QuestionnaireDto> Questionnaires { get; set; } = new();
    }
}
