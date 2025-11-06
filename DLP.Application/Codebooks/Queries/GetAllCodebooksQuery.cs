using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Codebooks.DTOs;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Codebooks.Queries;

public class GetAllCodebooksQuery : IRequest<Dictionary<CodebookTypeEnum, List<CodebookDto>>>
{ }

public class GetAllCodebooksQueryHandler : IRequestHandler<GetAllCodebooksQuery, Dictionary<CodebookTypeEnum, List<CodebookDto>>>
{
    private readonly IAppDbContext _dbContext;
    private readonly IActivityLogger _logger;
    private readonly ICurrentUserService _currentUserService; // Inject the ICurrentUserService

    public GetAllCodebooksQueryHandler(IAppDbContext dbContext, IActivityLogger logger, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _logger = logger;
        _currentUserService = currentUserService; // Inject the ICurrentUserService
    }

    public async Task<Dictionary<CodebookTypeEnum, List<CodebookDto>>> Handle(GetAllCodebooksQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var codebooks = await _dbContext.Codebooks.Where(x => x.IsDeleted != true).GroupBy(x => x.Type).ToDictionaryAsync(x => x.Key, x => x.Adapt<List<CodebookDto>>(), cancellationToken);

            await _logger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved codebooks"
            });

            return codebooks;
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to retrieve codebooks", _currentUserService.UserId);
            throw;
        }
    }
}
