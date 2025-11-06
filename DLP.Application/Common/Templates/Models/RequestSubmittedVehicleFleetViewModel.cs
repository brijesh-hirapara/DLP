namespace DLP.Application.Common.Templates.Models;

public class RequestSubmittedVehicleFleetViewModel
{
    public  Guid Id { get; set; }
    public  string RequestId { get; set; }
    public  string Reasons { get; set; }
    public required string UserName { get; set; }
    public required string UserEmail { get; set; }
    public required string UserLang { get; set; }
}
