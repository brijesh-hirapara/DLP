namespace DLP.Application.CompanyBranches.Requests;

public class CreateCompanyBranchRequest
{
    public string BranchOfficeName { get; set; }
    public string IdNumber { get; set; }
    public string Address { get; set; }
    public string Email { get; set; }
    public string ContactPerson { get; set; }
    public string ContactPhone { get; set; }
    public string Place { get; set; }
    public Guid MunicipalityId { get; set; }
}
