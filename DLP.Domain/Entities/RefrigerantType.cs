using DLP.Domain.Common;

namespace DLP.Domain.Entities
{
    public class RefrigerantType : SyncBase, IAuditableEntity
    {
        public Guid Id { get; set; }
        public string Name {get;set;}
        public string? ASHRAEDesignation {get; set; }
        public string? TypeOfCoolingFluid {get; set; }
        public string? GlobalWarmingPotential {get; set; }
        public string? ChemicalFormula { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedById { get; set; }
        public User CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedById { get; set; }
        public bool IsDeleted { get; set; }

        public virtual List<Equipment> Equipments {get;set;}
    }
}
