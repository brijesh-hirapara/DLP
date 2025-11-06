using System;
namespace DLP.Application.Common.Templates.Models
{
    public class ToggleUserActivationModel
    {
        public string UserLang { get; set; }
        public string Email { get; set; }
        public bool IsActive { get; set; }
    }
}

