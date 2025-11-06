using System;
using DLP.Application.Common.Pagination;

namespace DLP.Application.Reports.DTOs
{
    public class CompanyByEntityReportDto : IOrdinalNumber
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public int Total { get; set; }
        public int OrdinalNumber { get; set; }
    }
}

