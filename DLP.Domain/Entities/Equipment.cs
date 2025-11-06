using DLP.Domain.Common;

namespace DLP.Domain.Entities
{
    public class Equipment: SyncBase, IAuditableEntity
    {
        public Guid Id { get; set; }
        public Guid CompanyBranchId { get; set; }
        public virtual CompanyBranch CompanyBranch { get; set; }
        public Guid TypeOfEquipmentId { get; set; }
        public virtual Codebook TypeOfEquipment { get; set; }
        public string? TypeOfEquipmentOther { get; set; } // Fill where typeOfEquipment is Other
        public Guid? TypeOfCoolingSystemId { get; set; }
        public virtual Codebook TypeOfCoolingSystem { get; set; }
        public string? TypeOfCoolingSystemOther { get; set; } // Fill where typeOfCoolingSystem is Other

        public Guid? RefrigerantTypeId { get; set; }
        public virtual RefrigerantType RefrigerantType { get; set; }
        public string? Manufacturer { get; set; }
        public string? Type { get; set; }
        public string? Model { get; set; }
        public string? SerialNumber { get; set; }
        public int? YearOfProduction { get; set; }
        public DateTime? DateOfPurchase { get; set; }
        public double? MassOfRefrigerantKg { get; set; }
        public Guid? PurposeOfEquipmentId { get; set; }
        public virtual Codebook PurposeOfEquipment { get; set; }
        public double? CoolingTemperature { get; set; }
        public double? CoolingEffectKw { get; set; }
        public double? CompressorConnectionPowerKw { get; set; }
        public double? LiquidCollectorVolume { get; set; }
        public double? MassAddedLastYearInKg { get; set; }
        public DateTime? CommissioningDate { get; set; }
        public string? Comments { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedById { get; set; }
        public User CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedById { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsArchived { get; set; }

        public virtual List<EquipmentActivity> EquipmentActivities { get; set; } = new List<EquipmentActivity>();
        public virtual List<EquipmentFile> EquipmentFiles { get; set; } = new List<EquipmentFile>();
        public bool HasPendingSyncFiles { get; set; }

        public void CleanIncludes()
        {
            CreatedBy = null;
            CompanyBranch = null;
            TypeOfEquipment = null;
            RefrigerantType = null;
            PurposeOfEquipment = null;
            TypeOfCoolingSystem = null;
        }
    }

}
