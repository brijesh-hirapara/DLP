using System;
using DLP.Domain.Enums;

namespace DLP.Application.Common.Templates.Models
{
    public class CodebookChangeViewModel
    {
        public required string CodebookName { get; set; }

        public string Username { get; set; }
        public required CodebookActionEnum ActionType { get; set; }
        public string UserLang { get; set; }
        public string[] RecipientEmails { get; set; }
    }
}

