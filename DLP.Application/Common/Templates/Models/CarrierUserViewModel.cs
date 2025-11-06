namespace DLP.Application.Common.Templates.Models;

public class CarrierUserDetailsViewModel
{
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public string LanguageId { get; set; }
    public string UserLang { get; set; }
}


public class CarrierOfferEmailViewModel
{
    public string Email { get; set; }
    public string FullName { get; set; }
    public string UserLang { get; set; }
    public string RequestId { get; set; }
    public string PickupCity { get; set; }
    public string DeliveryCity { get; set; }
    public string GoodsDescription { get; set; }
    public decimal Weight { get; set; }
    public DateTime OfferDeadline { get; set; }
    public string Link { get; set; }
}

public class CarrierOfferResultEmailViewModel
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string UserLang { get; set; } = string.Empty;
    public string RequestId { get; set; } = string.Empty;
    public string EvaluationResult { get; set; } = string.Empty; // "Accepted" or "Rejected"
}

