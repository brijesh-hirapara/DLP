using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Common.Interfaces
{
    public interface IFinancialYearJob
    {
        Task SendFinancialYearEmail();
    }
}
