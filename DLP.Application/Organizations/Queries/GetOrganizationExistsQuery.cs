using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Organizations.DTOs;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Organizations.Queries;

public class GetOrganizationExistsQuery : IRequest<bool>
{
    public string IdNumber { get; set; }
}

public class GetOrganizationExistsQueryHandler : IRequestHandler<GetOrganizationExistsQuery, bool>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUserService;

    public GetOrganizationExistsQueryHandler(IAppDbContext context, IActivityLogger activityLogger, ICurrentUserService currentUserService)
    {
        _context = context;
        _activityLogger = activityLogger;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(GetOrganizationExistsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var exists =  _context.Organizations.Any(x => x.IdNumber == request.IdNumber);

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = $"Check for organization existence by ID number {request.IdNumber}: {exists}"
            });

            return exists;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to check organization existence", _currentUserService.UserId);
            throw;
        }
    }
}