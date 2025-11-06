using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Domain.Enums
{
    public enum VehicleFleetRequestStatus
    {
        [Description("Pending")]
        Pending = 0,
        [Description("Approved")]
        Confirmed = 1,
        [Description("Rejected")]
        Rejected = 2,
        [Description("Outdated")]
        Outdated = 3
    }
}
