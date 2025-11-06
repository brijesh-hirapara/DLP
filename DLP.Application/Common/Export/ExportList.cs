using DLP.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Common.Export;

public class ExportList
{
    public ExportTypeEnum ExportType { get; set; }
    public string CallFrom { get; set; }
    public string Search { get; set; }
    public int FilterType { get; set; }
    public bool ListArchived { get; set; }
    public string TimeZone { get; set; }
    public Guid? MunicipalityId { get; set; }
    public Guid? EntityId { get; set; }
    public string? TypeOfEquipmentId { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public Guid LanguageId { get; set; }
    public bool IsCarrier { get; set; } = false;
}
