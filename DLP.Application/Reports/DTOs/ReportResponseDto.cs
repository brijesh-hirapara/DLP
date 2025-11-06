using System;
using DLP.Application.Common.Pagination;

namespace DLP.Application.Reports.DTOs
{
    public class ReportResponseDto<T>: IOrdinalNumber
    {
        public T Id { get; set; }
        public string Name { get; set; }
        public int Total { get; set; }
        public Guid? StateEntityId { get; set; }
        public string? StateEntityName { get; set; }
        public int OrdinalNumber { get; set; }
    }
}

