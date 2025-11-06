using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DLP.Application.EmailConfiguration.Commands
{
    public class CreateNewEmailOptionsCommand : IRequest
    {
        public string From { get; set; }
        public string SmtpHost { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUser { get; set; }
        public string SmtpPass { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateNewEmailOptionsCommandHandler : IRequestHandler<CreateNewEmailOptionsCommand>
    {
        private readonly IAppDbContext _context;
        private readonly IEmailService _service;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<CreateNewEmailOptionsCommandHandler> _logger;


        public CreateNewEmailOptionsCommandHandler(IAppDbContext context, IEmailService service, IActivityLogger activityLogger, ICurrentUserService currentUserService, ILogger<CreateNewEmailOptionsCommandHandler> logger)
        {
            _context = context;
            _service = service;
            _activityLogger = activityLogger;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        public async Task Handle(CreateNewEmailOptionsCommand request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            var validConnection = await _service.TestConnectionAsync(request.From, request.SmtpHost, request.SmtpPort, request.SmtpUser, request.SmtpPass, false);
            if (!validConnection)
            {
                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.ERROR,
                    Activity = "Failed to create new email options: Invalid SMTP credentials."
                });
                errorMessage = "Please provide valid SMTP credentials. Connection with Server failed!";
                throw new Exception(errorMessage);
            }

            try
            {
                var active = await _context.EmailOptions.SingleOrDefaultAsync(x => x.IsActive, cancellationToken: cancellationToken);

                if (active != null)
                    active.IsActive = false;

                var options = new EmailOption
                {
                    From = request.From,
                    SmtpHost = request.SmtpHost,
                    SmtpPort = request.SmtpPort,
                    SmtpUser = request.SmtpUser,
                    SmtpPass = request.SmtpPass,
                    CreatedAt = request.CreatedAt,
                    IsActive = true
                };

                await _context.EmailOptions.AddAsync(options, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Email options created successfully."
                });
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Failed to create new email options", _currentUserService.UserId);
                _logger.LogError("ADDING_NEW_SMTP Failed", ex.Message);
                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }
        }
    }


}
