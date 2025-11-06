using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Domain.Entities
{
    public class VehicleFleetRequest
    {
        public Guid Id { get; set; }
        public int Status { get; set; }
        public string? Comments { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedById { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? ActionedAt { get; set; }
        public string? ActionedBy { get; set; }

    }
}
