using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Equipments.Notifications;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.ServiceTechnician.Commands
{
    public class DeleteServiceTechnicianReportCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }

    public class DeleteServiceTechnicianReportCommandHandler : IRequestHandler<DeleteServiceTechnicianReportCommand, Unit>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUserService;

        public DeleteServiceTechnicianReportCommandHandler(IAppDbContext context, IMediator mediator, IActivityLogger logger, ICurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _mediator = mediator;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(DeleteServiceTechnicianReportCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var serviceTechnicianReport = await _context.ServiceTechnicianReport.FindAsync(new object?[] { request.Id, cancellationToken }, cancellationToken: cancellationToken);

                //if (serviceTechnicianReport.IsArchived)
                //    throw new Exception("No action is allowed when Equipment is archived!");

                serviceTechnicianReport.IsDeleted = true;
                serviceTechnicianReport.UpdatedAt = DateTime.UtcNow;
                serviceTechnicianReport.UpdatedById = _currentUserService.UserId;
                serviceTechnicianReport.ActionTakenBy = _currentUserService.UserId;
                serviceTechnicianReport.ServiceTechnicianAnnualReport.ToList().ForEach(x =>
                {
                    x.IsDeleted = true;
                    x.ActionTakenBy = _currentUserService.UserId;
                    x.BeforeLocalSync();
                });


                serviceTechnicianReport.BeforeLocalSync();
                await _context.SaveChangesAsync(cancellationToken);

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Service Technician Report (ID: {request.Id}) deleted successfully."
                });

                await _mediator.Publish(new DeleteEquipmentNotification(request.Id), cancellationToken);

                return Unit.Value;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to delete Service Technician Report", _currentUserService.UserId);
                throw new Exception(ex.Message); ;
            }
        }
    }


}

