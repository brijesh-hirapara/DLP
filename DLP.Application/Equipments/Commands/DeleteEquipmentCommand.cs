using System;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Equipments.Notifications;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Equipments.Commands
{
    public class DeleteEquipmentCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }

    public class DeleteEquipmentCommandHandler : IRequestHandler<DeleteEquipmentCommand, Unit>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUserService;

        public DeleteEquipmentCommandHandler(IAppDbContext context, IMediator mediator, IActivityLogger logger, ICurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _mediator = mediator;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(DeleteEquipmentCommand request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            try
            {

                var equipment = await _context.Equipments.FindAsync(new object?[] { request.Id, cancellationToken }, cancellationToken: cancellationToken);


                if (equipment.IsArchived)
                {
                    errorMessage = "No action is allowed when Equipment is archived!";
                    throw new Exception(errorMessage);
                }

                equipment.IsDeleted = true;
                equipment.UpdatedAt = DateTime.UtcNow;
                equipment.UpdatedById = _currentUserService.UserId;
                equipment.ActionTakenBy = _currentUserService.UserId;

                equipment.BeforeLocalSync();
                await _context.SaveChangesAsync(cancellationToken);

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Equipment (ID: {request.Id}) deleted successfully."
                });

                await _mediator.Publish(new DeleteEquipmentNotification(request.Id), cancellationToken);

                return Unit.Value;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to delete equipment", _currentUserService.UserId);

                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }
        }
    }


}

