using DocumentFormat.OpenXml.ExtendedProperties;
using DocumentFormat.OpenXml.Office.CoverPageProps;
using iTextSharp.text.log;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Security;
using DLP.Application.Municipalities.Queries;
using DLP.Application.Qualifications.DTOs;
using DLP.Application.Qualifications.Queries;
using DLP.Application.Requests.Notifications;
using DLP.Application.UserGroups.Commands;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.Entity.Core.Metadata.Edm;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LicenseContext = OfficeOpenXml.LicenseContext;

namespace DLP.Application.Requests.Commands
{
    public class ImportRequestCommand : IRequest<string>
    {
        public IFormFile ImportFile { get; set; }
    }

    public class ImportRequestCommandHandler : IRequestHandler<ImportRequestCommand, string>
    {
        private readonly IMediator _mediator;
        private readonly IAppDbContext _dbContext;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUser;
        private IHostingEnvironment _Environment;
        private readonly IConfiguration _configuration;
        private readonly ILicenseIdGenerator _licenseIdGenerator;
        private readonly ICurrentUserService _currentUserService;
        private readonly ITranslationService _translationService;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;

        public ImportRequestCommandHandler(IAppDbContext dbContext, IActivityLogger activityLogger, ICurrentUserService currentUser, IHostingEnvironment environment, IConfiguration configuration, ICurrentUserService currentUserService, IMediator mediator, ILicenseIdGenerator licenseIdGenerator, ITranslationService translationService, UserManager<User> userManager, RoleManager<Role> roleManager)
        {
            _dbContext = dbContext;
            _activityLogger = activityLogger;
            _currentUser = currentUser;
            _Environment = environment;
            _configuration = configuration;
            _currentUserService = currentUserService;
            _mediator = mediator;
            _licenseIdGenerator = licenseIdGenerator;
            _translationService = translationService;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<string> Handle(ImportRequestCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if (command.ImportFile != null)
                {
                    //Create a Folder.
                    string contentPath = _Environment.ContentRootPath;
                    string wwwPath = _Environment.WebRootPath;

                    string path = Path.Combine(contentPath, "wwwroot", "ImportRequest");
                    if (!Directory.Exists(path))
                    {
                        Directory.CreateDirectory(path);
                    }

                    //Save the uploaded Excel file.
                    string fileName = Path.GetFileName(command.ImportFile.FileName);
                    string filePath = Path.Combine(path, fileName);
                    using (FileStream stream = new FileStream(filePath, FileMode.Create))
                    {
                        command.ImportFile.CopyTo(stream);
                    }

                    ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                    using (ExcelPackage package = new ExcelPackage(new FileInfo(filePath)))
                    {
                        ExcelWorksheet worksheet = package.Workbook.Worksheets[0]; // Assuming first worksheet

                        var nonEmptyRows = Enumerable.Range(1, worksheet.Dimension.End.Row)
                   .Where(row => Enumerable.Range(1, worksheet.Dimension.End.Column)
                       .Any(col => !string.IsNullOrWhiteSpace(worksheet.Cells[row, col].Text)))
                   .ToList();

                        int rowCount = nonEmptyRows.Count();

                        int colCount = worksheet.Dimension.Columns;

                        // Generate Error Excel Export
                        DataTable errorDt = new DataTable();
                        errorDt.Columns.AddRange(new DataColumn[3]
                        {
                            new DataColumn("ExcelRowNumber"),
                            new DataColumn("Status"),
                            new DataColumn("Message")
                        });

                        for (int row = 2; row <= rowCount; row++)
                        {
                            var name = Convert.ToString(worksheet.Cells[row, GetColumnIndex(worksheet, "Name")].Value) ?? "";
                            var idNumber = worksheet.Cells[row, GetColumnIndex(worksheet, "IdNumber")].Value.ToString() ?? "";
                            var taxNumber = worksheet.Cells[row, GetColumnIndex(worksheet, "TaxNumber")].Value?.ToString() ?? "";
                            var responsiblePeronFullName = worksheet.Cells[row, GetColumnIndex(worksheet, "ResponsiblepersonFullName")].Value.ToString() ?? "";
                            var ResponsiblePersonFunction = worksheet.Cells[row, GetColumnIndex(worksheet, "ResponsiblePersonFunction")].Value.ToString() ?? "";
                            var Address = worksheet.Cells[row, GetColumnIndex(worksheet, "Address")].Value.ToString() ?? "";
                            var Place = worksheet.Cells[row, GetColumnIndex(worksheet, "Place")].Value.ToString() ?? "";
                            var MunicipalityId = worksheet.Cells[row, GetColumnIndex(worksheet, "MunicipalityId")].Value.ToString() ?? "";
                            var Email = worksheet.Cells[row, GetColumnIndex(worksheet, "Email")].Value?.ToString() ?? "";
                            var PhoneNumber = worksheet.Cells[row, GetColumnIndex(worksheet, "PhoneNumber")].Value.ToString() ?? "";
                            var WebsiteUrl = worksheet.Cells[row, GetColumnIndex(worksheet, "WebsiteUrl")].Value?.ToString() ?? "";
                            var Type = 2;
                            var LicenseId = worksheet.Cells[row, GetColumnIndex(worksheet, "LicenseId")].Value?.ToString() ?? "";
                            var Comments = worksheet.Cells[row, GetColumnIndex(worksheet, "Comments")].Value?.ToString() ?? "";
                            //var FaxNumber = worksheet.Cells[row, GetColumnIndex(worksheet, "FaxNumber")].Value?.ToString() ?? "";
                            var municipality = await _mediator.Send(new GetMunicipalityDetailQuery
                            {
                                Id = new Guid(MunicipalityId),
                            });
                            var CantonId = municipality.CantonId;
                            var entityId = municipality.StateEntityId;


                            var requestExistChecked = await _dbContext.Requests.FirstOrDefaultAsync(x => (x.IdNumber == idNumber || x.ContactPersonEmail == Email) && x.Status == RequestStatus.Pending);
                            if (requestExistChecked != null)
                            {
                                var organizationId = _dbContext.Organizations.Where(x => !x.IsDeleted && x.Email == Email).Select(x => x.Id).FirstOrDefault();
                                var companyBranch = new CompanyBranch
                                {
                                    Id = Guid.NewGuid(),
                                    BranchOfficeName = name,
                                    IdNumber = idNumber,
                                    OrganizationId = organizationId,
                                    Address = Address,
                                    Email = Email,
                                    ContactPerson = responsiblePeronFullName,
                                    ContactPhone = PhoneNumber,
                                    Place = Place,
                                    MunicipalityId = new Guid(MunicipalityId),
                                    IsDeleted = false
                                };
                                _dbContext.CompanyBranches.Add(companyBranch);
                                continue;
                            }

                            var requestChecked = await _dbContext.Requests.FirstOrDefaultAsync(x => x.IdNumber == idNumber && x.Status != RequestStatus.Rejected);
                            if (requestChecked != null)
                            {

                                var organizationId = _dbContext.Organizations.Where(x => !x.IsDeleted && x.Email == Email).Select(x => x.Id).FirstOrDefault();
                                var companyBranch = new CompanyBranch
                                {
                                    Id = Guid.NewGuid(),
                                    BranchOfficeName = name,
                                    IdNumber = idNumber,
                                    OrganizationId = organizationId,
                                    Address = Address,
                                    Email = Email,
                                    ContactPerson = responsiblePeronFullName,
                                    ContactPhone = PhoneNumber,
                                    Place = Place,
                                    MunicipalityId = new Guid(MunicipalityId),
                                    IsDeleted = false
                                };
                                _dbContext.CompanyBranches.Add(companyBranch);
                                continue;
                            }


                            var request = new Request
                            {
                                Id = Guid.NewGuid(),
                                IdNumber = idNumber,
                                Address = Address,
                                Comments = Comments,
                                CompanyEmailAddress = Email,
                                CompanyName = ResponsiblePersonFunction,
                                CompanyPhoneNumber = PhoneNumber,
                                CompanyType = RequestCompanyType.Company,
                                ContactPerson = responsiblePeronFullName,
                                ContactPersonEmail = Email,
                                LanguageId = LanguageConstants.DefaultLanguageId.Value,
                                //MunicipalityId = new Guid(MunicipalityId),
                                Place = Place,
                                ResponsiblePersonFullName = responsiblePeronFullName,
                                ResponsiblePersonFunction = ResponsiblePersonFunction,
                                TaxNumber = taxNumber,
                                Status = RequestStatus.Approved,
                                WebsiteUrl = WebsiteUrl,
                                //Type = RequestType.RegistrationOfOwnersAndOperators,
                                RequestId = await GetNextRequestId(),
                                CreatedAt = DateTime.UtcNow,
                                IsFromPublic = false,
                            };

                            if (!string.IsNullOrEmpty(LicenseId))
                            {
                                request.LicenseId = LicenseId;
                            }

                            if (ShouldGenerateLicenseId(request.Type, request.LicenseId))
                            {
                                request.LicenseId = await _licenseIdGenerator.GenerateUniqueLicenseId();
                            }

                            await _dbContext.Requests.AddAsync(request, cancellationToken);
                            if (_currentUser.UserId != null)
                            {
                                await _activityLogger.Add(new ActivityLogDto
                                {
                                    UserId = _currentUser.UserId,
                                    LogTypeId = (int)LogTypeEnum.INFO,
                                    Activity = "Request created successfully!"
                                });
                            }
                            else
                            {
                                await _dbContext.SaveChangesAsync();
                            }

                            await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

                            try
                            {
                                var approverequest = await _dbContext.Requests
                                    //.Include(x => x.Municipality)
                                    .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
                                        ?? throw new Exception($"Request {request.Id} not found");

                                var shouldSendRequestApprovedEmail = true;
                                Organization? company = null;
                                // if request is coming from public
                                // or if it's internally added but company is not yet created (first request)
                                var companyNeedsToBeCreated = !string.IsNullOrEmpty(approverequest.CompanyEmailAddress) &&
                              !_dbContext.Organizations.Any(x => !x.IsDeleted && x.Email == approverequest.CompanyEmailAddress);
                                CompanyBranch? mainBranch = null;

                                if (companyNeedsToBeCreated)
                                {
                                    approverequest.UpdatedById = _currentUserService.UserId;
                                    (company, mainBranch) = await CreateUserAndCompany(approverequest, cancellationToken);
                                    approverequest.CompanyId = company.Id;

                                    // since its first request, we don't want to send email about approva
                                    // we only send greeting email that indicates company created
                                    shouldSendRequestApprovedEmail = false;
                                }
                                else
                                {
                                    company = await _dbContext.Organizations
                                        .Include(x => x.CreatedBy)
                                        .AsNoTracking()
                                        .FirstOrDefaultAsync(x => x.Email == approverequest.CompanyEmailAddress && !x.IsDeleted, cancellationToken);
                                   var organizationId = _dbContext.Organizations.Where(x => !x.IsDeleted && x.Email == approverequest.CompanyEmailAddress).Select(x=>x.Id).FirstOrDefault();
                                    var companyBranch = new CompanyBranch
                                    {
                                        Id = Guid.NewGuid(),
                                        BranchOfficeName = approverequest.CompanyName,
                                        IdNumber = approverequest.IdNumber,
                                        OrganizationId = organizationId,
                                        Address = approverequest.Address,
                                        Email = approverequest.CompanyEmailAddress,
                                        ContactPerson = approverequest.ContactPerson,
                                        ContactPhone = approverequest.CompanyPhoneNumber,
                                        Place = approverequest.Place,
                                        //MunicipalityId = approverequest.MunicipalityId,
                                        IsDeleted = false
                                    };
                                    _dbContext.CompanyBranches.Add(companyBranch);

                                }

                                if (company == null)
                                {
                                    await _activityLogger.Error("Something wrong happened during approval of request", _currentUser.UserId);

                                    throw new Exception("Something wrong happened during approval of request");
                                }

                                approverequest.Status = RequestStatus.Approved;
                                approverequest.ReviewedById = _currentUser.UserId;
                                approverequest.ReviewedAt = DateTime.Now;
                                //validate license id if different from current/auto-generated one
                                if (approverequest.LicenseId != request.LicenseId && !string.IsNullOrEmpty(request.LicenseId))
                                {
                                    var licenseIdExists = await _dbContext.Organizations.AnyAsync(x => x.LicenseId == request.LicenseId, cancellationToken);
                                    if (licenseIdExists)
                                    {
                                        await _activityLogger.Error($"License id {request.LicenseId} already exists", _currentUser.UserId);
                                        throw new Exception($"License id {request.LicenseId} already exists");
                                    }
                                    approverequest.LicenseId = request.LicenseId;
                                }                                
                                   
                                

                                if (ShouldGenerateLicenseId(approverequest))
                                {
                                    approverequest.LicenseId = await _licenseIdGenerator.GenerateUniqueLicenseId();
                                }

                                if (!companyNeedsToBeCreated)
                                {
                                    company.LicenseId = approverequest.LicenseId;
                                    company.LicenseDuration = approverequest.LicenseDuration;
                                    company.BusinessActivityId = approverequest.BusinessActivityId ?? company.BusinessActivityId;
                                    company.Type = approverequest.CompanyType.HasValue
                                        ? GetCompanyType(approverequest.CompanyType)
                                        : company.Type;
                                    _dbContext.Organizations.Update(company);
                                }

                                var (companyRegType, newRoles) = await AddCompanyRegisterTypesAndAssignUserGroup(approverequest.Type, company, shouldCreateSuperAdminUserGroup: companyNeedsToBeCreated, cancellationToken);                             

                                await _activityLogger.Add(new ActivityLogDto
                                {
                                    UserId = _currentUser.UserId,
                                    LogTypeId = (int)LogTypeEnum.INFO,
                                    Activity = "Successfully Approved Request"
                                });

                                var companyRegTypeId = companyRegType != null
                                    ? companyRegType.Id
                                    : Guid.Empty;
                                var mainBranchId = mainBranch != null
                                    ? mainBranch.Id
                                    : Guid.Empty;

                                await transaction.CommitAsync(cancellationToken);

                            }
                            catch (Exception ex)
                            {
                                var message = $"Message: {ex.Message}, Details: {JsonConvert.SerializeObject(ex)}";
                                await _activityLogger.Exception(message, "Failed to approve the request", _currentUser.UserId);
                                await transaction.RollbackAsync(cancellationToken);
                                throw new Exception(ex.Message);
                            }
                        }
                    }
                }
                return "Success";
            }
            catch (Exception)
            {
                throw;
            }
        }

        private async Task<(CompanyRegisterType CompanyRegisterType, List<string>? NewRoles)> AddCompanyRegisterTypesAndAssignUserGroup(RequestType requestType, Organization company, bool shouldCreateSuperAdminUserGroup, CancellationToken cancellationToken)
        {
            //if (requestType == RequestType.RequestForExtensionOfLicenseOfServiceCompanies)
            //{
            //    return (null, null);
            //}

            //var companyType = requestType == RequestType.RegistrationOfOwnersAndOperators
            //        ? CompanyType.OwnerAndOperator
            //        : requestType == RequestType.RegistrationAndLicensingOfServiceCompanies
            //            ? CompanyType.ServiceCompanyEnterpreneur
            //            : CompanyType.ImporterExporter;

            var companyType = requestType == RequestType.RegistraterAsShipper
                    ? CompanyType.Shipper : CompanyType.Carrier;
            var typeExists = await _dbContext.CompanyRegisterTypes
                    .FirstOrDefaultAsync(x => x.OrganizationId == company.Id && x.Type == companyType, cancellationToken);
            if (typeExists != null)
            {
                return (typeExists, null);
            }

            var newCompanyRegType = new CompanyRegisterType
            {
                Id = Guid.NewGuid(),
                OrganizationId = company.Id,
                Type = companyType
            };
            await _dbContext.CompanyRegisterTypes.AddAsync(newCompanyRegType, cancellationToken);

            var userGroups = await AssignUserGroup(requestType, company.CreatedBy!, company.Name, shouldCreateSuperAdminUserGroup, cancellationToken);
            return (newCompanyRegType, userGroups);
        }

        private async Task<List<string>> AssignUserGroup(RequestType requestType, User user, string companyName, bool shouldCreateSuperAdminUserGroup, CancellationToken cancellationToken)
        {
            var companyUserGroup = GetProperUserGroup(requestType);
            var userGroups = new List<string> { companyUserGroup };
            if (shouldCreateSuperAdminUserGroup)
            {
                var saTranslation = await _translationService
                .Translate(user.LanguageId.Value, "super-admin", "Super Administrator");
                var newRole = $"{companyName} - {saTranslation}";
                var exists = await _dbContext.Roles.AnyAsync(x => x.Name.Equals(newRole));
                if (!exists)
                {
                    var companyRole = await _roleManager.FindByNameAsync(companyUserGroup);
                    var userGroupPermissions = (await _roleManager.GetClaimsAsync(companyRole))
                        .Select(p => p.Value)
                        .ToHashSet();

                    await _mediator.Send(new AddUserGroupCommand
                    {
                        Name = newRole,
                        AccessLevel = AccessLevelType.Company,
                        Permissions = userGroupPermissions.Select(x => new UserGroupPermission
                        {
                            Name = x,
                            Checked = true,
                        }).ToList(),
                        Users = new()
                    {
                        new() {Id = user.Id},
                    },
                        CreatedById = user.Id,
                    }, cancellationToken);

                    userGroups.Add(newRole);
                }
            }

            await _userManager.AddToRolesAsync(user, userGroups);
            return userGroups;
        }

        private static string GetProperUserGroup(RequestType requestType)
        {
            return requestType switch
            {
                //RequestType.RegistrationOfOwnersAndOperators => PredefinedUserGroups.COMP_KGH_OWNER_OPERATOR,
                //RequestType.RegistrationAndLicensingOfServiceCompanies => PredefinedUserGroups.COMP_KGH_SERVICE,
                //RequestType.RegistrationAndLicensingOfImportersExporters => PredefinedUserGroups.COMP_KGH_IMPORT_EXPORT,

                RequestType.RegistraterAsShipper => PredefinedUserGroups.COMP_DLP_SHIPPER,
                RequestType.RegistraterAsCarrier => PredefinedUserGroups.COMP_DLP_CARRIER,
                _ => throw new ArgumentOutOfRangeException(nameof(requestType), requestType, null)
            };
        }

        private async Task<(Organization Organization, CompanyBranch CompanyBranch)> CreateUserAndCompany(Request request, CancellationToken cancellationToken)
        {
            var organization = await CreateOrganization(request, cancellationToken);
            var (companyContactPerson, oneTimePassword) = await CreateUser(request, organization);
            var branch = await CreateOrganizationMainBranch(organization, companyContactPerson, cancellationToken);
            await UpdateAuditOnOrganizationAndRequest(request, organization, companyContactPerson, request.UpdatedById!, cancellationToken);
            return (organization, branch);
        }

        private async Task<CompanyBranch> CreateOrganizationMainBranch(Organization organization, User companyContactPerson, CancellationToken cancellationToken)
        {
            var headQuarterTranslation = await _translationService
                .Translate(companyContactPerson.LanguageId.Value, "company-branch-headquarter", "Headquarter");
            var branch = new CompanyBranch
            {
                OrganizationId = organization.Id,
                Organization = organization,
                Address = organization.Address,
                Email = organization.Email,
                IdNumber = organization.IdNumber,
                //MunicipalityId = organization.MunicipalityId,
                Place = organization.Place,
                BranchOfficeName = $"{headQuarterTranslation} {organization.Name}",
                ContactPerson = companyContactPerson.FullName,
                ContactPhone = organization.PhoneNumber,
                CreatedAt = DateTime.Now,
                IsDeleted = false,
                CreatedById = organization.CreatedById,
                ActionTakenBy = organization.ContactPersonId,
            };
            branch.BeforeLocalSync();
            await _dbContext.CompanyBranches.AddAsync(branch, cancellationToken);
            return branch;
        }

        //private static bool ShouldGenerateLicenseId(Request request)
        //{
        //    return string.IsNullOrEmpty(request.LicenseId) && request.Type.IsOneOf(
        //        RequestType.RegistrationAndLicensingOfServiceCompanies,
        //        RequestType.RegistrationAndLicensingOfImportersExporters);
        //}

        private static bool ShouldGenerateLicenseId(Request request)
        {
            return string.IsNullOrEmpty(request.LicenseId) && request.Type.IsOneOf(
                RequestType.RegistraterAsShipper,
                RequestType.RegistraterAsCarrier);
        }

        private async Task UpdateAuditOnOrganizationAndRequest(Request request, Organization company, User companyContactPerson, string currentUserId, CancellationToken cancellationToken)
        {
            if (companyContactPerson == null)
            {                
                throw new Exception("Something wrong went happened during approval of request");
            }

            company.CreatedBy = companyContactPerson;
            company.CreatedById = companyContactPerson.Id;
            company.ContactPersonId = companyContactPerson.Id;
            request.CreatedBy = companyContactPerson;
            request.CreatedById = companyContactPerson.Id;
            request.CompanyId = company.Id;
            request.UpdatedById = currentUserId;
            request.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);

        }

        private async Task<(User User, string OneTimePassword)> CreateUser(Request request, Organization organization)
        {
            var (firstName, lastName) = GetFirstAndLastName(request.ContactPerson!);
            var user = new User
            {
                NormalizedEmail = request.ContactPersonEmail!,
                UserName = request.ContactPersonEmail!,
                Email = request.ContactPersonEmail!,
                FirstName = firstName,
                LastName = lastName,
                LanguageId = request.LanguageId, // TODO: to be changed
                OrganizationId = organization.Id,
                MunicipalityId = organization.MunicipalityId,
                StateEntityId = organization.StateEntityId,
                MustChangePassword = true,
                CreatedAt = DateTime.UtcNow,
                CreatedById = request.CreatedById,
                AccessLevel = AccessLevelType.Company,
            };

            var oneTimePassword = PasswordUtils.GenerateOTP();
            var result = await _userManager.CreateAsync(user, oneTimePassword);

            if (!result.Succeeded)
            {
                var errorMessages = string.Join("\n", result.Errors.Select(x => x.Description));
                throw new Exception(errorMessages);
            }
            return (user, oneTimePassword);
        }

        private async Task<Organization> CreateOrganization(Request request, CancellationToken cancellationToken)
        {
            var organizationId = Guid.NewGuid();
            var organization = new Organization
            {
                Id = organizationId,
                IdNumber = request.IdNumber,
                Name = request.CompanyName!,
                TaxNumber = request.TaxNumber,
                ResponsiblePersonFullName = request.ResponsiblePersonFullName,
                ResponsiblePersonFunction = request.ResponsiblePersonFunction,
                BusinessActivityId = request.BusinessActivityId,
                Address = request.Address,
                Place = request.Place,
                //MunicipalityId = request.MunicipalityId,
                //StateEntityId = request.Municipality.StateEntityId,
                PostCode = request.PostCode,
                Email = request.CompanyEmailAddress,
                PhoneNumber = request.CompanyPhoneNumber,
                WebsiteUrl = request.WebsiteUrl,
                LicenseId = request.LicenseId,
                LicenseDuration = request.LicenseDuration,
                Type = GetCompanyType(request.CompanyType),
                CreatedAt = DateTime.UtcNow,
                CreatedById = request.CreatedById,
                IsDeleted = false,
                ActionTakenBy = request.CreatedById,
            };
            organization.BeforeLocalSync();
            await _dbContext.Organizations.AddAsync(organization, cancellationToken);
            return organization;
        }

        private static OrganizationTypeEnum GetCompanyType(RequestCompanyType? companyType)
        {
            return companyType switch
            {
                RequestCompanyType.Company => OrganizationTypeEnum.COMPANY,
                RequestCompanyType.Entrepreneur => OrganizationTypeEnum.ENTREPRENEUR,
                RequestCompanyType.Importer => OrganizationTypeEnum.IMPORTER,
                RequestCompanyType.Exporter => OrganizationTypeEnum.EXPORTER,
                RequestCompanyType.ImporterExporter => OrganizationTypeEnum.IMPORTER_EXPORTER,
                _ => OrganizationTypeEnum.COMPANY,
            };
        }

        private int GetColumnIndex(ExcelWorksheet worksheet, string headerText)
        {
            int columnCount = worksheet.Dimension.End.Column;
            for (int col = 1; col <= columnCount; col++)
            {
                var cellValue = worksheet.Cells[1, col].Value?.ToString();
                if (string.Equals(cellValue, headerText, StringComparison.OrdinalIgnoreCase))
                {
                    return col;
                }
            }
            return -1; // Return -1 if column header is not found
        }

        private static bool ShouldGenerateLicenseId(RequestType type, string? licenseId)
        {
            return string.IsNullOrEmpty(licenseId) && type.IsOneOf(
                RequestType.RegistraterAsShipper,
                RequestType.RegistraterAsCarrier);
        }

        private async Task<string> GetNextRequestId()
        {
            // Retrieve the last numeric part of the highest RequestId in the database
            var lastNumericPart = await _dbContext.Requests
                .OrderByDescending(r => r.RequestId)
                .Select(r => r.RequestId.Substring(5)) // RequestId format is YEAR-XXXX (5 characters for year)
                .FirstOrDefaultAsync();

            int nextNumericPart = string.IsNullOrEmpty(lastNumericPart)
                ? 1
                : int.Parse(lastNumericPart) + 1;
            string year = DateTime.Now.Year.ToString();
            string formattedNumericPart = nextNumericPart.ToString("D4");
            string requestId = $"{year}-{formattedNumericPart}";

            return requestId;
        }
        private static (string, string) GetFirstAndLastName(string fullName)
        {
            var names = fullName.Split(' ');
            return names.Length >= 2 ? (names[0], names[1]) : // Assumes first word is the first name, second word is the last name.
                                                              // Handle cases where the full name doesn't split into two (like if there's only a first name). Adjust as necessary.
                (names[0], string.Empty);
        }
    }


}
