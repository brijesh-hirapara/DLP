using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.ImportExportSubstances.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.Extensions.Logging;

namespace DLP.Application.ImportExportSubstances.Commands
{
    public class CreateImportExportSubstancesReportCommand : IRequest<Unit>
    {
        public int Year { get; set; }
        public string ResponsiblePerson { get; set; }
        public DateTime SubmitedDate { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid UserId { get; set; }
        public List<ImportExportSubstancesAnnualReportDto> ImportExportSubstancesAnnualReport { get; set; }
    }

    public class CreateImportExportSubstancesReportCommandHandler : IRequestHandler<CreateImportExportSubstancesReportCommand, Unit>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IBlobService _blobService;
        private readonly ILogger<CreateImportExportSubstancesReportCommandHandler> _logger;
        private readonly IMediator _mediator;
        private readonly IActivityLogger _activityLogger;

        public CreateImportExportSubstancesReportCommandHandler(IAppDbContext context, IMediator mediator,
            IBlobServiceFactory blobServiceFactory, ICurrentUserService currentUserService,
            IActivityLogger activityLogger, ILogger<CreateImportExportSubstancesReportCommandHandler> logger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _blobService = blobServiceFactory.Create(FolderNames.Equipments);
            _logger = logger;
            _mediator = mediator;
            _activityLogger = activityLogger;
        }

        public async Task<Unit> Handle(CreateImportExportSubstancesReportCommand request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            var attachmentPaths = new List<string>();

            try
            {
                var isExist = _context.ImportExportSubstancesReport.Where(x => x.Year == request.Year && !x.IsDeleted && x.OrganizationId == _currentUserService.OrganizationId).FirstOrDefault();

                if (isExist != null)
                {
                    errorMessage = "A record already exists for the specified year.";
                    throw new Exception(errorMessage);
                }


                var importExportSubstancesReport = new ImportExportSubstancesReport
                {
                    Year = request.Year,
                    ResponsiblePerson = request.ResponsiblePerson,
                    SubmitedDate = request.SubmitedDate,
                    OrganizationId = request.OrganizationId,
                    UserId = request.UserId,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false,
                    CreatedById = _currentUserService.UserId,
                    ActionTakenBy = _currentUserService.UserId,
                    ImportExportSubstancesAnnualReport = request.ImportExportSubstancesAnnualReport.Count() > 0 ? await StoreToDirectory(request.ImportExportSubstancesAnnualReport, _currentUserService.UserId) : null,
                };

                importExportSubstancesReport.BeforeLocalSync();
                _context.ImportExportSubstancesReport.Add(importExportSubstancesReport);
                await _context.SaveChangesAsync(cancellationToken);

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Import Export Substances Report (ID: {importExportSubstancesReport.Id}) created successfully."
                });

                return Unit.Value;
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, "An error occurred while handling the CreateImportExportSubstancesReportCommandHandler");
                await _activityLogger.Exception(ex.Message, "Failed to create equipment", _currentUserService.UserId);
                throw new Exception(string.IsNullOrEmpty(errorMessage)?ex.Message: errorMessage);
            }
        }

        private async Task<List<ImportExportSubstancesAnnualReport>> StoreToDirectory(List<ImportExportSubstancesAnnualReportDto> importExportSubstancesAnnualReport, string userId)
        {
            var importExportSubstancesAnnualReportList = new List<ImportExportSubstancesAnnualReport>();


            foreach (var report in importExportSubstancesAnnualReport)
            {
                var annualReport = new ImportExportSubstancesAnnualReport
                {
                    RefrigerantTypeId = report.RefrigerantTypeId,
                    TariffNumber = report.TariffNumber,
                    Import = report.Import,
                    OwnConsumption = report.OwnConsumption,
                    SalesOnTheBiHMarket = report.SalesOnTheBiHMarket,
                    TotalExportedQuantity = report.TotalExportedQuantity,
                    StockBalanceOnTheDay = report.StockBalanceOnTheDay,
                    EndUser = report.EndUser,
                    CreatedAt = DateTime.UtcNow,
                    ActionTakenBy = userId,
                    LastSyncAt = DateTime.UtcNow,
                    SyncToken = Guid.NewGuid(),
                };
                importExportSubstancesAnnualReportList.Add(annualReport);
            }

            return importExportSubstancesAnnualReportList;
        }
    }
}