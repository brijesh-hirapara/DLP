using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.ServiceTechnician.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DLP.Application.ServiceTechnician.Commands
{
    public class UpdateServiceTechnicianReportCommand : IRequest<Unit>
    {

        public Guid Id { get; set; }
        public int Year { get; set; }
        public string ResponsiblePerson { get; set; }
        public DateTime SubmitedDate { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid UserId { get; set; }
        public List<ServiceTechnicianAnnualReportDto> ServiceTechnicianAnnualReport { get; set; }
    }

    public class UpdateServiceTechnicianReportCommandHandler : IRequestHandler<UpdateServiceTechnicianReportCommand, Unit>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IBlobService _blobService;
        private readonly ILogger<UpdateServiceTechnicianReportCommandHandler> _logger;
        private readonly IMediator _mediator;
        private readonly IActivityLogger _activityLogger;

        public UpdateServiceTechnicianReportCommandHandler(IAppDbContext context, IMediator mediator,
            IBlobServiceFactory blobServiceFactory, ICurrentUserService currentUserService,
            IActivityLogger activityLogger, ILogger<UpdateServiceTechnicianReportCommandHandler> logger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _blobService = blobServiceFactory.Create(FolderNames.Equipments);
            _logger = logger;
            _mediator = mediator;
            _activityLogger = activityLogger;
        }

        public async Task<Unit> Handle(UpdateServiceTechnicianReportCommand request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;

            //if (serviceTechnicianReport.IsArchived)
            //    throw new Exception("No action is allowed when Equipment is archived!");
            var attachmentPaths = new List<string>();

            try
            {
                var serviceTechnicianReport = await _context.ServiceTechnicianReport.Include(x =>x.ServiceTechnicianAnnualReport).Where(e => e.Id == request.Id && !e.IsDeleted).FirstOrDefaultAsync();

                if (serviceTechnicianReport is null)
                {
                    errorMessage = "Invalid Service Technician Report!";
                    throw new Exception(errorMessage);
                }
                if (serviceTechnicianReport != null)
                {
                    serviceTechnicianReport.Id = request.Id;
                    serviceTechnicianReport.Year = request.Year;
                    serviceTechnicianReport.ResponsiblePerson = request.ResponsiblePerson;
                    serviceTechnicianReport.SubmitedDate = request.SubmitedDate;
                    serviceTechnicianReport.OrganizationId = request.OrganizationId;
                    serviceTechnicianReport.UserId = request.UserId;
                    serviceTechnicianReport.UpdatedById = _currentUserService.UserId;
                    serviceTechnicianReport.UpdatedAt = DateTime.UtcNow;
                    serviceTechnicianReport.IsDeleted = false;
                    serviceTechnicianReport.ActionTakenBy = _currentUserService.UserId;


                    serviceTechnicianReport.BeforeLocalSync();

                    serviceTechnicianReport.ServiceTechnicianAnnualReport.ToList().ForEach(x =>
                    {
                        x.IsDeleted = true;
                        x.ActionTakenBy = _currentUserService.UserId;
                        x.BeforeLocalSync();
                    });

                    var annualReport = await StoreToDirectory(request.ServiceTechnicianAnnualReport, _currentUserService.UserId);
                    serviceTechnicianReport.ServiceTechnicianAnnualReport.AddRange(annualReport);

                    serviceTechnicianReport.BeforeLocalSync();
                    _context.ServiceTechnicianReport.Update(serviceTechnicianReport);
                    await _context.SaveChangesAsync(cancellationToken);

                    await _activityLogger.Add(new ActivityLogDto
                    {
                        UserId = _currentUserService.UserId,
                        LogTypeId = (int)LogTypeEnum.INFO,
                        Activity = $"Service Technician Report (ID: {request.Id}) updated successfully."
                    });
                }
                return Unit.Value;
            }
            catch (Exception ex)
            {
                foreach (var path in attachmentPaths)
                    await _blobService.DeleteFileAsync(path);

                _logger.LogError(ex, "An error occurred while handling the CreateEquipmentCommandHandler");
                await _activityLogger.Exception(ex.Message, "Failed to create equipment", _currentUserService.UserId);
                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }
        }

        private async Task<List<ServiceTechnicianAnnualReport>> StoreToDirectory(List<ServiceTechnicianAnnualReportDto> ServiceTechnicianAnnualReport, string userId)
        {
            var serviceTechnicianAnnualReportList = new List<ServiceTechnicianAnnualReport>();


            foreach (var report in ServiceTechnicianAnnualReport)
            {
                var requestFile = new ServiceTechnicianAnnualReport
                {
                    RefrigerantTypeId = report.RefrigerantTypeId,
                    Purchased = report.Purchased,
                    Collected = report.Collected,
                    Renewed = report.Renewed,
                    Sold = report.Sold,
                    Used1 = report.Used1,
                    Used2 = report.Used2,
                    Used3 = report.Used3,
                    Used4 = report.Used4,
                    StateOfSubstanceId = report.StateOfSubstanceId,
                    StockBalance = report.StockBalance,
                    CreatedAt = DateTime.UtcNow,
                    ActionTakenBy = userId,
                    LastSyncAt = DateTime.UtcNow,
                    SyncToken = Guid.NewGuid(),
                };
                serviceTechnicianAnnualReportList.Add(requestFile);
            }

            return serviceTechnicianAnnualReportList;
        }
    }
}