using DLP.Application.Common.Mappings;
using DLP.Domain.Enums;

namespace DLP.Application.ActivityLogs.Dto;

using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using Mapster;

public class ActivityLogDto : IMapFrom<ActivityLog>, IOrdinalNumber
{
    public int Id { get; set; }
    public int OrdinalNumber { get; set; }
    public string UserId { get; set; }
    public string User { get; set; }
    public string IP { get; set; }
    public int LogTypeId { get; set; }
    public string LogType { get; set; }
    public string Activity { get; set; }
    public string Description { get; set; }
    public string Date { get; set; }

    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<DLP.Domain.Entities.ActivityLog, ActivityLogDto>()
            .Map(dest => dest.User, src => src.User != null ? src.User.FullName : "-//-")
            .Map(dest => dest.LogTypeId, src => src.LogType == 4 ? 1 : src.LogType)
            .Map(dest => dest.LogType, src => src.LogType == 4 ? "INFO" : ((LogTypeEnum)src.LogType).ToString())
            .Map(dest => dest.Date, src => src.Date.ToString("dd/MM/yyyy HH:mm:ss"))
            .Map(dest => dest.Description, src => !string.IsNullOrEmpty(src.Description) ? src.Description : "");
    }
}
