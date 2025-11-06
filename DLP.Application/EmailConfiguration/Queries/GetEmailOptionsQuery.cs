using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.EmailConfiguration.DTOs;
using DLP.Domain.Enums;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.EmailConfiguration.Queries
{
    public class GetEmailOptionsQuery : IRequest<List<EmailOptionsDto>>
    {
    }

    public class GetEmailOptionsQueryHandler : IRequestHandler<GetEmailOptionsQuery, List<EmailOptionsDto>>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUserService;

        public GetEmailOptionsQueryHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUserService)
        {
            _context = context;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task<List<EmailOptionsDto>> Handle(GetEmailOptionsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var options = await _context.EmailOptions.OrderBy(x => x.IsActive).ToListAsync();
                var emailOptionsDtoList = options.Adapt<List<EmailOptionsDto>>();


                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Retrieved email options successfully."
                });

                return emailOptionsDtoList;
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to retrieve email options", _currentUserService.UserId);
                throw;
            }
        }
    }

}
