using System;
namespace DLP.Domain.Entities
{
    public class StateEntity
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public virtual List<Canton> Cantons { get; set; } // For Federation of Bosnia and Herzegovina
        public virtual List<Municipality> Municipalities { get; set; } // For Republika Srpska
    }
}

