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
    public class UpdateRefrigerantTypeCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? ASHRAEDesignation { get; set; }
        public string? TypeOfCoolingFluid { get; set; }
        public string? GlobalWarmingPotential { get; set; }
    }

    public class UpdateRefrigerantTypeCommandHandler : IRequestHandler<UpdateRefrigerantTypeCommand, bool>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IEmailCommunicationService _emailService;
        private readonly IMediator _mediator;
        private readonly IActivityLogger _logger;

        public UpdateRefrigerantTypeCommandHandler(IAppDbContext context, ICurrentUserService currentUserService, IEmailCommunicationService emailService, IMediator mediator, IActivityLogger logger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _emailService = emailService;
            _mediator = mediator;
            _logger = logger;
        }

        public async Task<bool> Handle(UpdateRefrigerantTypeCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var refrigerantType = await _context.RefrigerantTypes.FindAsync(request.Id);
                if (refrigerantType == null)
                {
                    await _logger.Error($"Failed to update Refrigerant Type with ID {request.Id}", "Refrigerant Type not found");
                    throw new NotFoundException(nameof(RefrigerantType), request.Id);
                }

                refrigerantType.Name = request.Name;
                refrigerantType.ASHRAEDesignation = request.ASHRAEDesignation;
                refrigerantType.TypeOfCoolingFluid = request.TypeOfCoolingFluid;
                refrigerantType.GlobalWarmingPotential = request.GlobalWarmingPotential;
                refrigerantType.UpdatedAt = DateTime.UtcNow;
                refrigerantType.UpdatedById = _currentUserService.UserId;
                refrigerantType.ActionTakenBy = _currentUserService.UserId;

                refrigerantType.BeforeLocalSync();
                await _context.SaveChangesAsync(cancellationToken);

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Refrigerant Type {request.Name} updated successfully"
                });
                var user = _context.Users.Where(x => x.Id == _currentUserService.UserId).FirstOrDefault();
                await _mediator.Publish(new UpdateRefrigerantTypeNotification(refrigerantType, Domain.Enums.CodebookActionEnum.UPDATE), cancellationToken);

                await _emailService.CodebookChangeNotification(new CodebookChangeViewModel { CodebookName = "Refrigerant Types => " + refrigerantType.Name,Username = user.Email, ActionType = Domain.Enums.CodebookActionEnum.UPDATE }, cancellationToken);

                return true;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to update Refrigerant Type", _currentUserService.UserId);
                throw;
            }
        }
    }


}

