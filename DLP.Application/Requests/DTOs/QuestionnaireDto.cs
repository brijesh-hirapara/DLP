using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Requests.DTOs
{
    public class QuestionnaireDto
    {
        public Guid Id { get; set; }
        public string RequestId { get; set; }
        public string RequestType { get; set; }
        public int QuestionNo { get; set; }
        public int Values { get; set; }
        public Guid? CodebookId { get; set; }
        public string? CodebookName { get; set; }
        public int TrailerQTY { get; set; }
        public Guid? CountryId { get; set; }
        public string? CountryName { get; set; }
    }
}
