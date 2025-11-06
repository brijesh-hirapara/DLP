using System;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.CertifiedTechnicians.Notifications;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Application.Qualifications.Commands;
using DLP.Application.Users.Commands;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DLP.Application.CertifiedTechnicians.Commands
{
    public class EndCurrentEmploymentCommand : IRequest<Unit>
    {
        public string TechnicianId { get; set; }
    }


    public class EndCurrentEmploymentCommandHandler : IRequestHandler<EndCurrentEmploymentCommand, Unit>
    {
        private readonly IMediator _mediator;
        private readonly IAppDbContext _dbContext;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUserService;

        public EndCurrentEmploymentCommandHandler(IMediator mediator, IAppDbContext dbContext, IActivityLogger activityLogger, ICurrentUserService currentUserService)
        {
            _mediator = mediator;
            _dbContext = dbContext;
            _activityLogger = activityLogger;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(EndCurrentEmploymentCommand request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            try
            {
                errorMessage = "Technician couldn't be found!";
                var technican = await _dbContext.Users
                    .Include(x => x.EmploymentHistory)
                    .FirstOrDefaultAsync(x => x.Id == request.TechnicianId, cancellationToken)
                    ?? throw new Exception(errorMessage);

                var employmentHistory = technican.EmploymentHistory
                .Where(x=> !x.EndDate.HasValue).ToList();

                if(employmentHistory == null || !employmentHistory.Any()){
                    errorMessage = "No record of the Employment History";
                    throw new Exception(errorMessage);
                }

                var endDate = DateTime.Now;
                employmentHistory.ForEach(item => {
                    item.EndDate = endDate;
                });

                technican.OrganizationId = null;

                _dbContext.Users.Update(technican);
                await _dbContext.SaveChangesAsync(cancellationToken);

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Ended current employment for technician with ID: {request.TechnicianId}"
                });

                await _mediator.Publish(new EndEmploymentNotification(technican.Id, endDate));
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, $"Failed to end current employment for technician with ID: {request.TechnicianId}", _currentUserService.UserId);
                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }

            return Unit.Value;
        }
    }

}

