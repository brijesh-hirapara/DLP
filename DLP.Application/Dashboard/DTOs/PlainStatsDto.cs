using System;
namespace DLP.Application.Dashboard.DTOs
{
    public class PlainStatsDto
    {
        public int TotalServiceCompanies { get; set; }
        public int TotalPendingRequests { get; set; }
        public int TotalActiveEquipments { get; set; }
        public int TotalActiveTechnicians { get; set; }
    }
}

