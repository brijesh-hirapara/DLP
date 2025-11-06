using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Domain.Entities
{
    public class I18nLanguageCode
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public virtual List<Language> Languages { get; set; }
    }
}
