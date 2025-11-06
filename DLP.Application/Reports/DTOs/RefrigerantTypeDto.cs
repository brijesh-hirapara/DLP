using System;
using DLP.Application.Common.Pagination;

namespace DLP.Application.Reports.DTOs
{
    public class RefrigerantTypeDto:IOrdinalNumber
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public double Quantity { get; set; }
        public Guid StateEntityId { get; set; }
        public string? StateEntityName { get; set; }
        public int OrdinalNumber { get; set; }
    }
}

