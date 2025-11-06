using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Requests.Commands
{
    //public class ImportServiceTechnicianCommand : IRequest<string>
    //{
    //    public IFormFile ImportFile { get; set; }
    //}

    //public class ImportServiceTechnicianCommandHandler : IRequestHandler<ImportServiceTechnicianCommand, string>
    //{
    //    private readonly IMediator _mediator;
    //    private readonly IAppDbContext _dbContext;
    //    private readonly IActivityLogger _activityLogger;
    //    private readonly ICurrentUserService _currentUser;
    //    private IHostingEnvironment _Environment;
    //    private readonly IConfiguration _configuration;
    //    private readonly ILicenseIdGenerator _licenseIdGenerator;
    //    private readonly ICurrentUserService _currentUserService;
    //    private readonly ITranslationService _translationService;
    //    private readonly UserManager<User> _userManager;
    //    private readonly RoleManager<Role> _roleManager;

    //    public ImportServiceTechnicianCommandHandler(IMediator mediator, IAppDbContext dbContext, IActivityLogger activityLogger, ICurrentUserService currentUser, IHostingEnvironment environment, IConfiguration configuration, ILicenseIdGenerator licenseIdGenerator, ICurrentUserService currentUserService, ITranslationService translationService, UserManager<User> userManager, RoleManager<Role> roleManager)
    //    {
    //        _mediator = mediator;
    //        _dbContext = dbContext;
    //        _activityLogger = activityLogger;
    //        _currentUser = currentUser;
    //        _Environment = environment;
    //        _configuration = configuration;
    //        _licenseIdGenerator = licenseIdGenerator;
    //        _currentUserService = currentUserService;
    //        _translationService = translationService;
    //        _userManager = userManager;
    //        _roleManager = roleManager;
    //    }

    //    public async Task<string> Handle(ImportServiceTechnicianCommand command, CancellationToken cancellationToken)
    //    {
    //        try
    //        {
    //            if (command.ImportFile != null)
    //            {
    //                //Create a Folder.
    //                string contentPath = _Environment.ContentRootPath;
    //                string wwwPath = _Environment.WebRootPath;

    //                string path = Path.Combine(contentPath, "wwwroot", "ImportRequest");
    //                if (!Directory.Exists(path))
    //                {
    //                    Directory.CreateDirectory(path);
    //                }

    //                //Save the uploaded Excel file.
    //                string fileName = Path.GetFileName(command.ImportFile.FileName);
    //                string filePath = Path.Combine(path, fileName);
    //                using (FileStream stream = new FileStream(filePath, FileMode.Create))
    //                {
    //                    command.ImportFile.CopyTo(stream);
    //                }

    //                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
    //                using (ExcelPackage package = new ExcelPackage(new FileInfo(filePath)))
    //                {
    //                    ExcelWorksheet worksheet = package.Workbook.Worksheets[0]; // Assuming first worksheet

    //                    var nonEmptyRows = Enumerable.Range(1, worksheet.Dimension.End.Row)
    //              .Where(row => Enumerable.Range(1, worksheet.Dimension.End.Column)
    //                  .Any(col => !string.IsNullOrWhiteSpace(worksheet.Cells[row, col].Text)))
    //              .ToList();

    //                    int rowCount = nonEmptyRows.Count();

    //                    int colCount = worksheet.Dimension.Columns;

    //                    // Generate Error Excel Export
    //                    DataTable errorDt = new DataTable();
    //                    errorDt.Columns.AddRange(new DataColumn[3]
    //                    {
    //                        new DataColumn("ExcelRowNumber"),
    //                        new DataColumn("Status"),
    //                        new DataColumn("Message")
    //                    });

    //                    for (int row = 2; row <= rowCount; row++)
    //                    {
    //                        var name = Convert.ToString(worksheet.Cells[row, GetColumnIndex(worksheet, "Name")].Value) ?? "";
    //                        var idNumber = worksheet.Cells[row, GetColumnIndex(worksheet, "IdNumber")].Value.ToString() ?? "";
    //                        var taxNumber = worksheet.Cells[row, GetColumnIndex(worksheet, "TaxNumber")].Value?.ToString() ?? "";
    //                    }
    //                }
    //            }
    //        }
    //        catch (Exception ex)
    //        {

    //            throw;
    //        }
    //    }
    //    private int GetColumnIndex(ExcelWorksheet worksheet, string headerText)
    //    {
    //        int columnCount = worksheet.Dimension.End.Column;
    //        for (int col = 1; col <= columnCount; col++)
    //        {
    //            var cellValue = worksheet.Cells[1, col].Value?.ToString();
    //            if (string.Equals(cellValue, headerText, StringComparison.OrdinalIgnoreCase))
    //            {
    //                return col;
    //            }
    //        }
    //        return -1; // Return -1 if column header is not found
    //    }
    //}

}
