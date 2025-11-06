using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Domain.Entities
{
    public class Questionnaire : SyncBase
    {
        public Guid Id { get; set; }
        public string RequestId { get; set; }
        public string RequestType { get; set; }
        public int QuestionNo { get; set; }
        public int Values { get; set; }
        //public Guid? CodebookId { get; set; }
        public Guid? CodebookId { get; set; }
        public int TrailerQTY {  get; set; }
        //public Guid? CountryId { get; set; }
        public Guid? CountryId { get; set; }
        public string? ModuleName { get; set; } = "Request";
    }
    public class QuestionnaireRequestParameter
    {
        public string Id { get; set; }
        public string RequestId { get; set; }
        public string RequestType { get; set; }
        public int QuestionNo { get; set; }
        public int Values { get; set; }
        //public Guid? CodebookId { get; set; }
        public string? CodebookId { get; set; }
        public int TrailerQTY { get; set; }
        //public Guid? CountryId { get; set; }
        public string? CountryId { get; set; }        
    }
}
