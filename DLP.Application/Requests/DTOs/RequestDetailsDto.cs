using DLP.Application.Common.Extensions;
using DLP.Application.Common.Mappings;
using DLP.Application.Qualifications.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using Mapster;

namespace DLP.Application.Requests.DTOs;

public class RequestFileDto : IMapFrom<RequestFile>
{
    public Guid Id { get; set; }
    public string? FileName { get; set; }
    public long? Size { get; set; }
    public string? ContentType { get; set; }

    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<RequestFile, RequestFileDto>();
    }
}

public class RequestDetailsDto : IMapFrom<Request>
{
    public Guid Id { get; set; }
    public string IdNumber { get; set; }
    public string RequestId { get; set; }
    public string? CompanyName { get; set; }
    public string? CompanyEmailAddress { get; set; }
    public string? CompanyPhoneNumber { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? TaxNumber { get; set; }
    public string? ResponsiblePersonFullName { get; set; }
    public string? ResponsiblePersonFunction { get; set; }
    public string? ContactPerson { get; set; }
    public string? ContactPersonEmail { get; set; }
    public string? Address { get; set; }
    public string? Place { get; set; }
    public string? PostCode { get; set; }
    public string? Comments { get; set; }
    //public Guid MunicipalityId { get; set; }
    //public string Municipality { get; set; }
    //public string Canton { get; set; }
    //public string Entity { get; set; }
    public string? LicenseId { get; set; }
    public DateTime? LicenseDuration { get; set; }
    //public List<CertificateNumberAvailabilityResult> CertificationNumbers { get; set; }
    //public int? TotalNumberOfServiceTechnians { get; set; }
    public bool? MeetsEquipmentRegulations { get; set; }
    public DateTime CreatedAt { get; set; }
    public RequestType RequestType { get; set; }
    public string RequestTypeDesc { get; set; }
    public RequestStatus Status { get; set; }
    public string StatusDesc { get; set; }
    public string? CompanyType { get; set; }
    //public string? AreaOfExpertise { get; set; }
    //public Guid? BusinessActivityId { get; set; }
    //public string? BusinessActivity { get; set; }
    public string? ReviewedByName { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public ICollection<RequestFileDto> Attachments { get; set; } = new List<RequestFileDto>();
    public ICollection<QuestionnaireDto> Questionnaires { get; set; } = new List<QuestionnaireDto>();
    public bool ReceiveNews { get; set; }
    public bool HasVatIdAndAcceptsTerms { get; set; }
    public Guid CountryId { get; set; }
    public string CountryName { get; set; }

    public void Mapping(TypeAdapterConfig config)
    {
        config.ForType<Request, RequestDetailsDto>()
           .Map(dest => dest.StatusDesc, src => src.Status.GetRawDescription())
           .Map(dest => dest.RequestType, src => src.Type)
           .Map(dest => dest.RequestTypeDesc, src => src.Type.GetRawDescription())
           .Map(dest => dest.CompanyType,
                src => src.CompanyType.HasValue ? src.CompanyType.GetRawDescription() : null)
           //.Map(dest => dest.Municipality, src => src.Municipality.Name)
           //.Map(dest => dest.BusinessActivity, src => src.BusinessActivity != null ? src.BusinessActivity.Name : "")
           //.Map(dest => dest.Canton, src => src.Municipality.Canton.Name)
           //.Map(dest => dest.Entity, src => src.Municipality.StateEntity.Name)
           //.Map(dest => dest.MunicipalityId, src => src.Municipality.Id)
           //.Ignore(x => x.CertificationNumbers)
           //.Ignore(x => x.AreaOfExpertise)
           .Ignore(x => x.ReviewedByName);
           //.Ignore(x => x.BusinessActivity);
    }
}
