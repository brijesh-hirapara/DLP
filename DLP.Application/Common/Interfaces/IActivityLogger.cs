using DLP.Application.ActivityLogs.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Common.Interfaces
{
    public interface IActivityLogger
    {
        Task Add(ActivityLogDto activity);
        Task Add(List<ActivityLogDto> activities);
        Task Error(string error, string description = null, string userId = null);
        Task Exception(string exception, string description = null, string userId = null);
        Task Info(string info, string description = null, string userId = null);
    }
}
