using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Codebooks.DTOs;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Codebooks.Queries;

public class GetCodebookDetailsQuery : IRequest<CodebookDto>
{
    public Guid Id { get; }

    public GetCodebookDetailsQuery(Guid id)
    {
        Id = id;
    }
}

public class GetCodebookDetailsQueryHandler : IRequestHandler<GetCodebookDetailsQuery, CodebookDto>
{
    private readonly IAppDbContext _dbContext;
    private readonly IActivityLogger _logger;
    private readonly ICurrentUserService _currentUserService;

    public GetCodebookDetailsQueryHandler(IAppDbContext dbContext, IActivityLogger logger, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _logger = logger;
        _currentUserService = currentUserService;
    }

    public async Task<CodebookDto> Handle(GetCodebookDetailsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var codebook = await _dbContext.Codebooks
                .FirstOrDefaultAsync(c => c.Id == request.Id && !c.IsDeleted, cancellationToken);

            if (codebook == null)
                return null;

            await _logger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved codebook details"
            });

            return new CodebookDto
            {
                Id = codebook.Id,
                Name = codebook.Name
            };
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to retrieve codebook details", _currentUserService.UserId);
            throw;
        }
    }
}
