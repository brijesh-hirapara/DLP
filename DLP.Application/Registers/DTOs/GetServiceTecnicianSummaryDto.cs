using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Registers.DTOs
{
    public class GetServiceTecnicianSummaryDto
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; }
        public string SortType { get; set; }
        public string Search { get; set; }
        public string? LanguageId { get; set; }
    }
}
