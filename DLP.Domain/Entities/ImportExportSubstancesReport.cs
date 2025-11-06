using DLP.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Domain.Entities
{
    public class ImportExportSubstancesReport : SyncBase, IAuditableEntity
    {
        public Guid Id { get; set; }
        public int Year { get; set; }
        public string ResponsiblePerson { get; set; }
        public DateTime? SubmitedDate { get; set; }
        public Guid OrganizationId { get; set; }
        public virtual Organization Organization { get; set; }
        public Guid UserId { get; set; }
        public virtual User User { get; set; }
        public virtual List<ImportExportSubstancesAnnualReport> ImportExportSubstancesAnnualReport { get; set; } = new List<ImportExportSubstancesAnnualReport>();
        public DateTime CreatedAt { get; set; }
        public string? CreatedById { get; set; }
        public User CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedById { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsArchived { get; set; }
    }
}
