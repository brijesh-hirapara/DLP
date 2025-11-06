using DLP.Application.Common.Extensions;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;

namespace DLP.Application.Requests.DTOs;

public class ListRequestDto : IMapFrom<Request>, IOrdinalNumber
{
    public Guid Id { get; set; }
    public int OrdinalNumber { get; set; }
    public string Name { get; set; }
    public string IdNumber { get; set; }
    public string RequestId { get; set; }
    public DateTime CreatedAt { get; set; }
    public RequestType RequestType { get; set; }
    public string RequestTypeDesc { get; set; }
    public RequestStatus Status { get; set; }
    public string StatusDesc { get; set; }
    //public string Municipality { get; set; }
    //public Guid MunicipalityId { get; set; }
    public bool MustChangePassword { get; set; }
    public Guid? ContactPersonId { get; set; }

    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<Request, ListRequestDto>()
           .Map(dest => dest.Name, src => src.CompanyName)
           .Map(dest => dest.Status, src => src.Status)
           .Map(dest => dest.StatusDesc, src => src.Status.GetRawDescription())
           .Map(dest => dest.RequestType, src => src.Type)
           .Map(dest => dest.RequestTypeDesc, src => src.Type.GetRawDescription())
           //.Map(dest => dest.Municipality, src => src.Municipality.Name)
           //.Map(dest => dest.MunicipalityId, src => src.Municipality.Id)
           .Map(dest => dest.MustChangePassword, src => src.Company.ContactPerson.MustChangePassword ? src.Company.ContactPerson.MustChangePassword:false )
           .Map(dest => dest.ContactPersonId, src => src.Company.ContactPerson.MustChangePassword ? src.Company.ContactPerson.Id : null );
    }
}
