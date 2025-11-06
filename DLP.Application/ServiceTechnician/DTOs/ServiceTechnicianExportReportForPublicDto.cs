using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.ServiceTechnician.DTOs;

public class ServiceTechnicianExportReportForPublicDto
{
    public Dictionary<string, string> ColumnNames { get; set; }
    public List<MVTEOAnnualExcelDto> Data { get; set; }
}


public class MVTEOAnnualExcelDto
{
    public int No { get; set; }
    public string NameOfSubstance { get; set; }
    public string ChemicalFormula { get; set; }
    public string Symbol { get; set; }
    public decimal Purchased { get; set; }
    public decimal Collected { get; set; }
    public decimal Renewed { get; set; }
    public decimal Sold { get; set; }
    public decimal TotalUsed1 { get; set; }
    public decimal TotalUsed2 { get; set; }
    public decimal TotalUsed3 { get; set; }
    public decimal TotalUsed4 { get; set; }
    public decimal StockBalance { get; set; }
}