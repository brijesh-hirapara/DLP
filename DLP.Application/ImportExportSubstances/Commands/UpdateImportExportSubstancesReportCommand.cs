using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.ImportExportSubstances.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DLP.Application.ImportExportSubstances.Commands
{
    public class UpdateImportExportSubstancesReportCommand : IRequest<Unit>
    {

        public Guid Id { get; set; }
        public int Year { get; set; }
        public string ResponsiblePerson { get; set; }
        public DateTime SubmitedDate { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid UserId { get; set; }
        public List<ImportExportSubstancesAnnualReportDto> ImportExportSubstancesAnnualReport { get; set; }
    }

    public class UpdateImportExportSubstancesReportCommandHandler : IRequestHandler<UpdateImportExportSubstancesReportCommand, Unit>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IBlobService _blobService;
        private readonly ILogger<UpdateImportExportSubstancesReportCommandHandler> _logger;
        private readonly IMediator _mediator;
        private readonly IActivityLogger _activityLogger;

        public UpdateImportExportSubstancesReportCommandHandler(IAppDbContext context, IMediator mediator,
            IBlobServiceFactory blobServiceFactory, ICurrentUserService currentUserService,
            IActivityLogger activityLogger, ILogger<UpdateImportExportSubstancesReportCommandHandler> logger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _blobService = blobServiceFactory.Create(FolderNames.Equipments);
            _logger = logger;
            _mediator = mediator;
            _activityLogger = activityLogger;
        }

        public async Task<Unit> Handle(UpdateImportExportSubstancesReportCommand request, CancellationToken cancellationToken)
        {

            string errorMessage = string.Empty;
            //if (serviceTechnicianReport.IsArchived)
            //    throw new Exception("No action is allowed when Equipment is archived!");
            var attachmentPaths = new List<string>();

            try
            {
                var importExportSubstancesReport = await _context.ImportExportSubstancesReport.Include(x => x.ImportExportSubstancesAnnualReport).Where(e => e.Id == request.Id && !e.IsDeleted).FirstOrDefaultAsync();

                if (importExportSubstancesReport is null) {
                    errorMessage = "Invalid Service Technician Report!";
                    throw new Exception(errorMessage);
                }
                if (importExportSubstancesReport != null)
                {
                    importExportSubstancesReport.Id = request.Id;
                    importExportSubstancesReport.Year = request.Year;
                    importExportSubstancesReport.ResponsiblePerson = request.ResponsiblePerson;
                    importExportSubstancesReport.SubmitedDate = request.SubmitedDate;
                    importExportSubstancesReport.OrganizationId = request.OrganizationId;
                    importExportSubstancesReport.UserId = request.UserId;
                    importExportSubstancesReport.UpdatedById = _currentUserService.UserId;
                    importExportSubstancesReport.UpdatedAt = DateTime.UtcNow;
                    importExportSubstancesReport.IsDeleted = false;
                    importExportSubstancesReport.ActionTakenBy = _currentUserService.UserId;
                    importExportSubstancesReport.BeforeLocalSync();

                    importExportSubstancesReport.ImportExportSubstancesAnnualReport.ToList().ForEach(x =>
                    {
                        x.IsDeleted = true;
                        x.ActionTakenBy = _currentUserService.UserId;
                        x.BeforeLocalSync();
                    });

                    var annualReport = await StoreToDirectory(request.ImportExportSubstancesAnnualReport, _currentUserService.UserId);
                    importExportSubstancesReport.ImportExportSubstancesAnnualReport.AddRange(annualReport);

                    importExportSubstancesReport.BeforeLocalSync();
                    _context.ImportExportSubstancesReport.Update(importExportSubstancesReport);
                    await _context.SaveChangesAsync(cancellationToken);

                    await _activityLogger.Add(new ActivityLogDto
                    {
                        UserId = _currentUserService.UserId,
                        LogTypeId = (int)LogTypeEnum.INFO,
                        Activity = $"Import Export Substances Report (ID: {request.Id}) updated successfully."
                    });
                }
                return Unit.Value;
            }
            catch (Exception ex)
            {
                foreach (var path in attachmentPaths)
                    await _blobService.DeleteFileAsync(path);

                _logger.LogError(ex, "An error occurred while handling the CreateEquipmentCommandHandler");
                await _activityLogger.Exception(ex.Message, "Failed to Update Import Export Substances Report", _currentUserService.UserId);
                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }
        }

        private async Task<List<ImportExportSubstancesAnnualReport>> StoreToDirectory(List<ImportExportSubstancesAnnualReportDto> ImportExportSubstancesAnnualReport, string userId)
        {
            var importExportSubstancesAnnualReportList = new List<ImportExportSubstancesAnnualReport>();


            foreach (var report in ImportExportSubstancesAnnualReport)
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