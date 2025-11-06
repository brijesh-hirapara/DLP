using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Equipments.Notifications;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.ImportExportSubstances.Commands
{
    public class DeleteImportExportSubstancesReportCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }

    public class DeleteImportExportSubstancesReportCommandHandler : IRequestHandler<DeleteImportExportSubstancesReportCommand, Unit>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUserService;

        public DeleteImportExportSubstancesReportCommandHandler(IAppDbContext context, IMediator mediator, IActivityLogger logger, ICurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _mediator = mediator;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(DeleteImportExportSubstancesReportCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var importExportSubstancesReport = await _context.ImportExportSubstancesReport.FindAsync(new object?[] { request.Id, cancellationToken }, cancellationToken: cancellationToken);

                //if (serviceTechnicianReport.IsArchived)
                //    throw new Exception("No action is allowed when Equipment is archived!");

                importExportSubstancesReport.IsDeleted = true;
                importExportSubstancesReport.UpdatedAt = DateTime.UtcNow;
                importExportSubstancesReport.UpdatedById = _currentUserService.UserId;
                importExportSubstancesReport.ActionTakenBy = _currentUserService.UserId;
                importExportSubstancesReport.ImportExportSubstancesAnnualReport.ToList().ForEach(x =>
                {
                    x.IsDeleted = true;
                    x.ActionTakenBy = _currentUserService.UserId;
                    x.BeforeLocalSync();
                });


                importExportSubstancesReport.BeforeLocalSync();
                await _context.SaveChangesAsync(cancellationToken);

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Import Export Substances Report (ID: {request.Id}) deleted successfully."
                });

                await _mediator.Publish(new DeleteEquipmentNotification(request.Id), cancellationToken);

                return Unit.Value;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to delete Import Export Substances Report", _currentUserService.UserId);
                throw;
            }
        }
    }


}

