using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.ServiceTechnician.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Data.Entity;

namespace DLP.Application.ServiceTechnician.Commands
{
    public class CreateServiceTechnicianReportCommand : IRequest<Unit>
    {

        public int Year { get; set; }
        public string ResponsiblePerson { get; set; }
        public DateTime SubmitedDate { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid UserId { get; set; }
        public List<ServiceTechnicianAnnualReportDto> ServiceTechnicianAnnualReport { get; set; }
    }

    public class CreateServiceTechnicianReportCommandHandler : IRequestHandler<CreateServiceTechnicianReportCommand, Unit>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IBlobService _blobService;
        private readonly ILogger<CreateServiceTechnicianReportCommandHandler> _logger;
        private readonly IMediator _mediator;
        private readonly IActivityLogger _activityLogger;

        public CreateServiceTechnicianReportCommandHandler(IAppDbContext context, IMediator mediator,
            IBlobServiceFactory blobServiceFactory, ICurrentUserService currentUserService,
            IActivityLogger activityLogger, ILogger<CreateServiceTechnicianReportCommandHandler> logger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _blobService = blobServiceFactory.Create(FolderNames.Equipments);
            _logger = logger;
            _mediator = mediator;
            _activityLogger = activityLogger;
        }

        public async Task<Unit> Handle(CreateServiceTechnicianReportCommand request, CancellationToken cancellationToken)
        {
            var attachmentPaths = new List<string>();

            try
            {

                var isExist = _context.ServiceTechnicianReport.Where(x=>x.Year == request.Year && !x.IsDeleted && x.OrganizationId == _currentUserService.OrganizationId).FirstOrDefault();

                if (isExist != null)
                {
                    throw new Exception("A record already exists for the specified year.");
                }

                var serviceTechnicianReport = new ServiceTechnicianReport
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
                    ServiceTechnicianAnnualReport = request.ServiceTechnicianAnnualReport.Count() > 0 ? await StoreToDirectory(request.ServiceTechnicianAnnualReport, _currentUserService.UserId) : null,
                };

                serviceTechnicianReport.BeforeLocalSync();
                _context.ServiceTechnicianReport.Add(serviceTechnicianReport);
                await _context.SaveChangesAsync(cancellationToken);

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Service Technician Report (ID: {serviceTechnicianReport.Id}) created successfully."
                });

                return Unit.Value;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while handling the CreateServiceTechnicianReportCommandHandler");
                await _activityLogger.Exception(ex.Message, "Failed to create Service Technician Report", _currentUserService.UserId);
                throw new Exception(ex.Message); ;
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