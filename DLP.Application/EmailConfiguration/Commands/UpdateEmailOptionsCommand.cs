using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.EmailConfiguration.Commands
{
    public class UpdateEmailOptionsCommand : IRequest
    {
        public Guid Id { get; set; }
        public string From { get; set; }
        public string SmtpHost { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUser { get; set; }
        public string SmtpPass { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateEmailOptionsCommandHandler : IRequestHandler<UpdateEmailOptionsCommand>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUserService;

        public UpdateEmailOptionsCommandHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task Handle(UpdateEmailOptionsCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var options = await _context.EmailOptions.SingleOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

                if (options == null)
                {
                    await _logger.Add(new ActivityLogDto
                    {
                        UserId = _currentUserService.UserId,
                        LogTypeId = (int)LogTypeEnum.ERROR,
                        Activity = "Failed to update email options: Options not found."
                    });

                    throw new NotFoundException();
                }

                options.From = request.From;
                options.SmtpHost = request.SmtpHost;
                options.SmtpPort = request.SmtpPort;
                options.SmtpUser = request.SmtpUser;
                options.SmtpPass = request.SmtpPass;

                await _context.SaveChangesAsync(cancellationToken);

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Email options updated successfully."
                });
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to update email options", _currentUserService.UserId);
                throw;
            }
        }
    }


}
