using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.CompanyBranches.Commands;

public class DeleteCompanyBranchCommand : IRequest<Unit>
{
    public Guid BranchId { get; set; }
}

public class DeleteCompanyBranchCommandHandler : IRequestHandler<DeleteCompanyBranchCommand, Unit>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _logger;
    private readonly ICurrentUserService _currentUserService;

    public DeleteCompanyBranchCommandHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUserService)
    {
        _context = context;
        _logger = logger;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(DeleteCompanyBranchCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var companyBranch = await _context.CompanyBranches
                .FirstOrDefaultAsync(b => b.Id == request.BranchId, cancellationToken);

            if (companyBranch == null)
            {
                throw new NotFoundException($"Company branch with ID {request.BranchId} not found.");
            }

            companyBranch.IsDeleted = true;
            companyBranch.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            await _logger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Company branch deleted successfully"
            });

            return Unit.Value;
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to delete a company branch", _currentUserService.UserId);
            throw;
        }
    }
}

