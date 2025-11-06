using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Registers.DTOs;

public class RegisterOverviewDto
{
    public string EntityName { get; set; }
    public int TotalServiceCompanies { get; set; }
    public int TotalKghEquiementCompanies { get; set; }
    public int TotalImportsCompanies { get; set; }
    public int CertifiedTechnicies { get; set; }
}
