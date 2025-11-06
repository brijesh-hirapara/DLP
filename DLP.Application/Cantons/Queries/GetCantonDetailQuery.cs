using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Cantons.DTOs;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Cantons.Queries
{
    public class GetCantonDetailQuery : IRequest<CantonDto>
    {
        public Guid Id { get; set; }
    }

    public class GetCantonDetailQueryHandler : IRequestHandler<GetCantonDetailQuery, CantonDto>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IActivityLogger _logger;
        private readonly ICurrentUserService _currentUserService;

        public GetCantonDetailQueryHandler(IAppDbContext dbContext, IActivityLogger logger, ICurrentUserService currentUserService)
        {
            _dbContext = dbContext;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task<CantonDto> Handle(GetCantonDetailQuery request, CancellationToken cancellationToken)
        {
            string errorMessage = string.Empty;
            try
            {
                errorMessage = "Invalid Canton";
                var canton = await _dbContext.Cantons
                    .Include(c => c.StateEntity)
                    .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken)
                    ?? throw new Exception(errorMessage);

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Retrieved details for canton with ID: {request.Id}"
                });

                return canton.Adapt<CantonDto>();
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, $"Failed to retrieve details for canton with ID: {request.Id}", _currentUserService.UserId);

                throw new Exception(string.IsNullOrEmpty(errorMessage) ? ex.Message : errorMessage);
            }
        }
    }

}