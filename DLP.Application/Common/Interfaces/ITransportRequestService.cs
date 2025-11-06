using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Common.Interfaces
{
    public interface ITransportRequestService
    {
        Task ChangeTransportEvaluationStatus(string requestId, string startTime, string name);
        Task ChangeTransportCompletedOrRejected(string requestId, string startTime, string name);
    }
}
