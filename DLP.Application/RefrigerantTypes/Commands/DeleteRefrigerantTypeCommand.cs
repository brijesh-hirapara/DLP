using System;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.RefrigerantTypes.Notifications;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.RefrigerantTypes.Commands
{
    public class DeleteRefrigerantTypeCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }

    public class DeleteRefrigerantTypeCommandHandler : IRequestHandler<DeleteRefrigerantTypeCommand, bool>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IEmailCommunicationService _emailService;
        private readonly IActivityLogger _logger;
        private readonly IMediator _mediator;

        public DeleteRefrigerantTypeCommandHandler(IAppDbContext context, ICurrentUserService currentUserService, IEmailCommunicationService emailService, IActivityLogger logger, IMediator mediator)
        {
            _context = context;
            _currentUserService = currentUserService;
            _emailService = emailService;
            _logger = logger;
            _mediator = mediator;
        }

        public async Task<bool> Handle(DeleteRefrigerantTypeCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var refrigerantType = await _context.RefrigerantTypes.FindAsync(request.Id);
                if (refrigerantType == null)
                {
                    await _logger.Error($"Failed to delete Refrigerant Type with ID {request.Id}", "Refrigerant Type not found");
                    throw new NotFoundException(nameof(RefrigerantType), request.Id);
                }

                 refrigerantType.IsDeleted = true;
                refrigerantType.UpdatedAt = DateTime.UtcNow;
                refrigerantType.UpdatedById = _currentUserService.UserId;
                refrigerantType.ActionTakenBy = _currentUserService.UserId;
                refrigerantType.SyncToken = Guid.NewGuid();
                refrigerantType.LastSyncAt = DateTime.UtcNow;


                await _context.SaveChangesAsync(cancellationToken);

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Refrigerant Type {refrigerantType.Name} deleted successfully"
                });
            await _mediator.Publish(new UpdateRefrigerantTypeNotification(refrigerantType, Domain.Enums.CodebookActionEnum.DELETE), cancellationToken);

                await _emailService.CodebookChangeNotification(new CodebookChangeViewModel { CodebookName = "Refrigerant Types => " + refrigerantType.Name, ActionType = Domain.Enums.CodebookActionEnum.DELETE }, cancellationToken);

                return true;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to delete Refrigerant Type", _currentUserService.UserId);
                throw;
            }
        }
    }
}

