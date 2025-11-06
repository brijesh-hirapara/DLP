using ClosedXML.Excel;
using DocumentFormat.OpenXml.Wordprocessing;
using DLP.Application.Cantons.Queries;
using DLP.Application.CertifiedTechnicians.Queries;
using DLP.Application.Codebooks.DTOs;
using DLP.Application.Codebooks.Queries;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Pagination;
using DLP.Application.Municipalities.Queries;
using DLP.Application.Organizations.Queries;
using DLP.Application.Qualifications.DTOs;
using DLP.Application.Qualifications.Queries;
using DLP.Application.RefrigerantTypes.DTO;
using DLP.Application.RefrigerantTypes.Queries;
using DLP.Application.Registers.DTOs;
using DLP.Application.Registers.Queries;
using DLP.Application.Requests.Commands;
using DLP.Application.ServiceTechnician.DTOs;
using DLP.Application.ServiceTechnician.Queries;
using DLP.Application.StateEntities.Queries;
using DLP.Application.Users.Queries;
using DLP.Controllers.Shared;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Reflection.Metadata;

namespace DLP.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("api/[controller]")]
    public class PublicController : ApiControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IWebHostEnvironment _env;
        private readonly ITranslationService _translationService;
        private readonly UserManager<User> _userManager;
        private readonly ICurrentUserService _currentUserService;

        public PublicController(IWebHostEnvironment env, ITranslationService translationService, UserManager<User> userManager, ICurrentUserService currentUserService, IMediator mediator)
        {
            _env = env;
            _translationService = translationService;
            _userManager = userManager;
            _currentUserService = currentUserService;
            _mediator = mediator;
        }

        [HttpGet("municipalities")]
        public async Task<IActionResult> GetMunicipalities()
        {
            var response = await Mediator.Send(new GetAllMunicipalitiesQuery { PageSize = -1 });
            return Ok(response.Items);
        }

        [HttpGet("state-entities")]
        public async Task<IActionResult> GetStateEntities()
        {
            var response = await Mediator.Send(new GetAllStateEntitiesQuery { PageSize = -1 });
            return Ok(response.Items);
        }

        [HttpGet("cantons")]
        public async Task<IActionResult> GetCantons()
        {
            var response = await Mediator.Send(new GetAllCantonsQuery { PageSize = -1 });
            return Ok(response.Items);
        }

        //[HttpGet("business-activities")]
        //public async Task<IActionResult> GetBusinessActivities()
        //{
        //    var response = await Mediator.Send(new GetCodebooksByTypeQuery { PageSize = -1, Type = Domain.Enums.CodebookTypeEnum.BusinessActivity });
        //    return Ok(response.Items);
        //}

        [HttpPost("requests/submit")]
        public async Task<ActionResult<string>> CreateRequest([FromForm] CreateRequestCommand command)
        {
            try
            {
                command.CompanyId = null;
                command.CurrentUserId = string.Empty; // bcz is from public
                command.IsFromPublic = true;
                command.IsLoggedInAsCompany = false;
                var response = await Mediator.Send(command);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        [HttpPost("requests/certificate-numbers-validity")]
        public async Task<ActionResult<List<CertificateNumberAvailabilityResult>>> CheckCertificateNumbersValidity([FromBody] CheckCertificateNumberAvailabilityQuery query)
            => Ok(await Mediator.Send(query));

        [HttpGet("organization-exists/{idNumber}")]
        public async Task<ActionResult<bool>> GetOrganizationDetails([FromRoute] string idNumber)
        {
            var organizationExists = await Mediator.Send(new GetOrganizationExistsQuery
            {
                IdNumber = idNumber,
            });
            return Ok(organizationExists);
        }

        [HttpPost("registers")]
        public async Task<ActionResult<List<RegisterForPublicDto>>> GetRegisters([FromBody] GetRegistersForPublicQuery request)
        {
            try
            {
                if (request.CompanyType != 0)
                {
                    return Ok(await GetCompanyDataByType(request));
                }

                return Ok(await GetAllCompanyData(request));
            }
            catch (System.Exception ex)
            {

                throw;
            }
        }

        [HttpGet("registers/{id}")]
        public async Task<ActionResult<RegisterDetailsDto>> GetRegisterDetails([FromRoute] Guid id)
        {
            var response = await Mediator.Send(new GetRegisterDetailsQuery
            {
                Id = id
            });
            return Ok(response);
        }

        [HttpGet("registers/companies-count")]
        public async Task<ActionResult<RegisterOverviewDto>> GetRegisterOverView([FromQuery] Guid? entityId)
        {
            var response = await Mediator.Send(new GetRegisterOverviewQuery
            {
                EntityId = entityId
            });
            return Ok(response);
        }


        [HttpGet("service-technician-report/summary")]
        public async Task<ActionResult<List<ServiceTechnicianAnnualReportSummaryDto>>> GetServiceTechnicianReportSummary([FromBody]GetServiceTecnicianSummaryDto query)
        {
            var response = await Mediator.Send(new GetServiceTechnicianReportSummaryQuery
            {
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                Search = query.Search,
                SortBy = query.SortBy,
                SortType = query.SortType
            });
            return response.Items.ToList();
        }

        [HttpGet("service-technician-report/summary/export")]
        public async Task<ActionResult<ServiceTechnicianExportReportForPublicDto>> GetServiceTechnicianReportExport([FromBody] GetServiceTecnicianSummaryDto query)
        {
            //var response = await Mediator.Send(new GetServiceTechnicianReportSummaryQuery
            //{
            //    PageNumber = query.PageNumber,
            //    PageSize = query.PageSize,
            //    Search = query.Search,
            //    SortBy = query.SortBy,
            //    SortType = query.SortType,
            //    IsFromExport = true
            //});

            // Instantiate the ExportController with the same dependencies
            //var exportController = new ExportController(_env, _translationService, _userManager, _currentUserService,_mediator);
            //var request = new Application.Common.Export.ExportList
            //{
            //    ExportType = ExportTypeEnum.Excel,
            //    CallFrom = "MVTEO Annual Report On Collected Substances",
            //    Search = query.Search,
            //    LanguageId = new Guid(query.LanguageId)
            //};

            var MVTEOAnnualResponse = await _mediator.Send(new GetServiceTechnicianReportSummaryQuery { Search = query.Search, IsFromExport = true });
            var MVTEOAnnualExcel = MVTEOAnnualResponse.Items.Select(u => new MVTEOAnnualExcelDto
            {
                No = u.OrdinalNumber,
                NameOfSubstance = u.RefrigerantTypeName,
                ChemicalFormula = u.RefrigerantTypeChemicalFormula,
                Symbol = u.RefrigerantTypeASHRAEDesignation,
                Purchased = Math.Round(u.TotalPurchased, 3),
                Collected = Math.Round(u.TotalCollected, 3),
                Renewed = Math.Round(u.TotalRenewed, 3),
                Sold = Math.Round(u.TotalSold, 3),
                TotalUsed1 = Math.Round(u.TotalUsed1, 3),
                TotalUsed2 = Math.Round(u.TotalUsed2, 3),
                TotalUsed3 = Math.Round(u.TotalUsed3, 3),
                TotalUsed4 = Math.Round(u.TotalUsed4, 3),
                StockBalance = Math.Round(u.TotalStockBalance, 3)
            }).ToList();
            var userLanguageId = new Guid(query.LanguageId);
            var userColumnNames = new Dictionary<string, string>
                    {
                        { "No",await _translationService.Translate(userLanguageId, "reports.ordinalNumber", "No") },
                        { "NameOfSubstance",await _translationService.Translate(userLanguageId, "global.name-of-substance-mixture", "NameOfSubstance")  },
                        { "ChemicalFormula",await _translationService.Translate(userLanguageId, "global.chemical-formula", "ChemicalFormula")  },
                        { "Symbol",await _translationService.Translate(userLanguageId, "global.symbol", "Symbol")  },
                        { "Purchased",await _translationService.Translate(userLanguageId, "global.purchased-acquired", "Purchased")  },
                        { "Collected",await _translationService.Translate(userLanguageId, "global.collected", "Collected")  },
                        { "Renewed",await _translationService.Translate(userLanguageId, "global.renewed", "Renewed")  },
                        { "Sold",await _translationService.Translate(userLanguageId, "global.Sold", "Sold")  },
                        { "TotalUsed1",await _translationService.Translate(userLanguageId, "global.used-1", "TotalUsed1")  },
                        { "TotalUsed2",await _translationService.Translate(userLanguageId, "global.used-2", "TotalUsed2")  },
                        { "TotalUsed3",await _translationService.Translate(userLanguageId, "global.used-3", "TotalUsed3")  },
                        { "TotalUsed4",await _translationService.Translate(userLanguageId, "global.used-4", "TotalUsed4")  },
                        { "StockBalance",await _translationService.Translate(userLanguageId, "global.stock-balance", "StockBalance")  }
                    };

            var response = new ServiceTechnicianExportReportForPublicDto
            {
                ColumnNames = userColumnNames,
                Data = MVTEOAnnualExcel
            };

            return Ok(response);

            //var response =  exportController.Export(request);

            //return Ok(response);            
        }

        private IActionResult ExportType<T>(IEnumerable<T> data, ExportTypeEnum exportType, string name, Dictionary<string, string> headerColumns)
        {
            switch (exportType)
            {
                case ExportTypeEnum.Excel:
                    // Create Excel file
                    var excelBytes = ExportToExcel(data, headerColumns);
                    return Ok(File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", name + ".xlsx"));
                default:
                    throw new InvalidOperationException("Invalid export type.");
            }
        }

        private byte[] ExportToExcel<T>(IEnumerable<T> data, Dictionary<string, string> headerColumns)
        {
            try
            {
                using (var workbook = new XLWorkbook())
                {
                    IXLWorksheet worksheet = workbook.Worksheets.Add("Sheet1");

                    // Add column headers
                    var properties = typeof(T).GetProperties();

                    for (int i = 0; i < properties.Length; i++)
                    {
                        worksheet.Cell(1, i + 1).Value = Convert.ToString(properties[i].Name);
                    }
                    // Add column headers from the headerColumns dictionary
                    int columnIndex = 1;
                    foreach (var header in headerColumns)
                    {
                        worksheet.Cell(1, columnIndex++).Value = header.Value; // Use the translated value
                    }

                    // Add data
                    int row = 2;
                    foreach (var item in data)
                    {
                        for (int i = 0; i < properties.Length; i++)
                        {
                            var value = properties[i].GetValue(item);
                            worksheet.Cell(row, i + 1).Value = value != null ? value.ToString() : string.Empty;
                        }
                        row++;
                    }

                    // Save workbook to a MemoryStream
                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        return stream.ToArray();
                    }


                }
            }
            catch (Exception ex)
            {
                // Log the exception for debugging
                Console.WriteLine($"Error exporting data to Excel: {ex.Message}");
                throw; // Re-throw the exception to propagate it further
            }
        }

        [HttpGet("user-exists/{email}")]
        public async Task<ActionResult<bool>> UserAlreadyExists([FromRoute] string email)
        {
            var available = await Mediator.Send(new GetEmailAvailabilityQuery { Email = email });
            return Ok(!available);
        }

        [HttpGet("codebooks")]
        public async Task<ActionResult<Dictionary<CodebookTypeEnum, List<CodebookDto>>>> GetAllAsDictionary([FromQuery] GetAllCodebooksQuery request)
        {
            return Ok(await Mediator.Send(request));
        }

        [HttpGet("refrigerant-types")]
        public async Task<ActionResult<List<RefrigerantTypeDto>>> GetRefrigerantTypes()
        {
            var result = await Mediator.Send(new GetRefrigerantTypesQuery()
            {
                PageSize = -1
            });
            return Ok(result.Items);
        }

        #region helpers
        private async Task<IEnumerable<RegisterForPublicDto>> GetCompanyDataByType(GetRegistersForPublicQuery request)
        {


            return request.CompanyType.Value switch
            {
                1 => (await Mediator.Send(CreateOwnerOperatorQuery(request)))?.Items.Select(item => new RegisterForPublicDto
                {
                    Id = item.Id,
                    CompanyName = item.CompanyName,
                    NrOfBranches = item.NrOfBranches,
                    NrOfEquipments = item.NrOfEquipments,
                    Municipality = item.Municipality,
                }),
                2 => (await Mediator.Send(CreateServiceCompanyQuery(request)))?.Items.Select(item => new RegisterForPublicDto
                {
                    Id = item.Id,
                    CompanyName = item.CompanyName,
                    StatusDesc = item.StatusDesc,
                    CompanyType = item.CompanyType,
                    NrOfCertifiedServiceTechnicians = item.NrOfCertifiedServiceTechnicians,
                    Municipality = item.Municipality,

                }),
                3 => (await Mediator.Send(CreateImporterExporterQuery(request)))?.Items.Select(item => new RegisterForPublicDto
                {
                    Id = item.Id,
                    CompanyName = item.CompanyName,
                    CompanyType = item.CompanyType,
                    LicenseDuration = item.LicenseDuration,
                    LicenseId = item.LicenseId,
                    Municipality = item.Municipality
                }),
               4 => (await Mediator.Send(CreateCertifiedTechniciansQuery(request)))?.Items.Select(item => new RegisterForPublicDto
                {
                    Id = (Guid)item.OrganizationId,
                    CompanyName = item.TrainingCenter,
                    Municipality = item.Municipality
                }),
                _ => new List<RegisterForPublicDto>(),
            };
        }

        private async Task<IEnumerable<RegisterForPublicDto>> GetAllCompanyData(GetRegistersForPublicQuery request)
        {
            var response = new List<RegisterForPublicDto>();

            var owners = (await Mediator.Send(CreateOwnerOperatorQuery(request))).Items;
            var importers = (await Mediator.Send(CreateImporterExporterQuery(request))).Items;
            var serviceCompany = (await Mediator.Send(CreateServiceCompanyQuery(request))).Items;

            response.AddRange(owners.Select(item => new RegisterForPublicDto
            {
                Id = item.Id,
                CompanyName = item.CompanyName,
                NrOfBranches = item.NrOfBranches,
                NrOfEquipments = item.NrOfEquipments,
                Municipality = item.Municipality,
            }));

            response.AddRange(importers.Select(item => new RegisterForPublicDto
            {
                Id = item.Id,
                CompanyName = item.CompanyName,
                CompanyType = item.CompanyType,
                LicenseDuration = item.LicenseDuration,
                LicenseId = item.LicenseId,
                Municipality = item.Municipality
            }));

            response.AddRange(serviceCompany.Select(item => new RegisterForPublicDto
            {
                Id = item.Id,
                CompanyName = item.CompanyName,
                StatusDesc = item.StatusDesc,
                CompanyType = item.CompanyType,
                NrOfCertifiedServiceTechnicians = item.NrOfCertifiedServiceTechnicians,
                Municipality = item.Municipality,

            }));

            return response;
        }


        private GetOwnersOperatorsOfEquipmentsQuery CreateOwnerOperatorQuery(GetRegistersForPublicQuery request)
        {
            return new GetOwnersOperatorsOfEquipmentsQuery
            {
                PageSize = -1,
                MunicipalityId = request.MunicipalityId,
                Search = request.Search,
                SkipAccessCheck = true,
                EntityId= request.EntityId,
            };
        }

        private GetKGHServiceCompaniesQuery CreateServiceCompanyQuery(GetRegistersForPublicQuery request)
        {
            return new GetKGHServiceCompaniesQuery
            {
                BusinessActivityId = request.BusinessActivityId,
                PageSize = -1,
                MunicipalityId = request.MunicipalityId,
                Search = request.Search,
                SkipAccessCheck = true,
                EntityId= request.EntityId,
            };
        }

        private GetImportersExportersCompaniesQuery CreateImporterExporterQuery(GetRegistersForPublicQuery request)
        {
            return new GetImportersExportersCompaniesQuery
            {
                PageSize = -1,
                MunicipalityId = request.MunicipalityId,
                Search = request.Search,
                SkipAccessCheck = true,
                EntityId = request.EntityId,
            };
        }
        
        private GetCertifiedTechniciansQuery CreateCertifiedTechniciansQuery(GetRegistersForPublicQuery request)
        {
            return new GetCertifiedTechniciansQuery
            {
                PageSize = -1,
                MunicipalityId = request.MunicipalityId,
                Search = request.Search,
                EntityId = request.EntityId,
            };
        }
        #endregion
    }
}

