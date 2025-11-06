using System;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Codebooks.NotificationModels;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Templates.Models;
using DLP.Application.RefrigerantTypes.Notifications;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using static DLP.Application.Common.Auth.CustomPolicies;

namespace DLP.Application.RefrigerantTypes.Commands
{
    public class CreateRefrigerantTypeCommand : IRequest<Unit>
    {
        public string Name { get; set; }
        public string? ASHRAEDesignation { get; set; }
        public string? TypeOfCoolingFluid { get; set; }
        public string? GlobalWarmingPotential { get; set; }
    }

    public class CreateRefrigerantTypeCommandHandler : IRequestHandler<CreateRefrigerantTypeCommand, Unit>
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IEmailCommunicationService _emailService;
        private readonly IMediator _mediator;
        private readonly IActivityLogger _logger;

        public CreateRefrigerantTypeCommandHandler(IAppDbContext context, ICurrentUserService currentUserService, IEmailCommunicationService emailService, IMediator mediator, IActivityLogger logger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _emailService = emailService;
            _mediator = mediator;
            _logger = logger;
        }

        public async Task<Unit> Handle(CreateRefrigerantTypeCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var refrigerantType = new RefrigerantType
                {
                    Name = request.Name,
                    ASHRAEDesignation = request.ASHRAEDesignation,
                    TypeOfCoolingFluid = request.TypeOfCoolingFluid,
                    GlobalWarmingPotential = request.GlobalWarmingPotential,
                    CreatedAt = DateTime.UtcNow,
                    CreatedById = _currentUserService.UserId,
                    IsDeleted = false
                };
                refrigerantType.BeforeLocalSync();
                _context.RefrigerantTypes.Add(refrigerantType);
                await _context.SaveChangesAsync(cancellationToken);
                await _mediator.Publish(new AddRefrigerantTypeNotification(refrigerantType), cancellationToken);

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Refrigerant Type {request.Name} created successfully"
                });
                var user = _context.Users.Where(x=>x.Id == _currentUserService.UserId).FirstOrDefault();

                await _emailService.CodebookChangeNotification(new CodebookChangeViewModel { CodebookName = "Refrigerant Types => " + request.Name,Username = user.FirstName + user.LastName , ActionType = Domain.Enums.CodebookActionEnum.ADD }, cancellationToken);

                return Unit.Value;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, $"Failed to create refrigerant type {request.Name}");
                throw;
            }
        }
    }

}

