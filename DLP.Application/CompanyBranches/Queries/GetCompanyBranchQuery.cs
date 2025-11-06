using DLP.Application.CompanyBranches.DTOs;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using DLP.Application.ActivityLogs.Dto;
using DLP.Domain.Enums;

namespace DLP.Application.CompanyBranches.Queries;

public class GetCompanyBranchQuery : IRequest<CompanyBranchDto>
{
    public Guid BranchId { get; set; }
}

public class GetCompanyBranchQueryHandler : IRequestHandler<GetCompanyBranchQuery, CompanyBranchDto>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _logger;
    private readonly ICurrentUserService _currentUserService;

    public GetCompanyBranchQueryHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUserService)
    {
        _context = context;
        _logger = logger;
        _currentUserService = currentUserService;
    }

    public async Task<CompanyBranchDto> Handle(GetCompanyBranchQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var companyBranch = await _context.CompanyBranches
                .FirstOrDefaultAsync(b => b.Id == request.BranchId, cancellationToken);

            if (companyBranch == null)
            {
                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.ERROR,
                    Activity = "Failed to retrieve company branch"
                });

                throw new NotFoundException($"Company branch with ID {request.BranchId} not found.");
            }

            var companyBranchDto = MapToCompanyBranchDto(companyBranch);

            await _logger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved company branch"
            });

            return companyBranchDto;
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to retrieve company branch", _currentUserService.UserId);
            throw;
        }
    }

    private static CompanyBranchDto MapToCompanyBranchDto(CompanyBranch companyBranch)
    {
        return new CompanyBranchDto
        {
            Id = companyBranch.Id,
            BranchOfficeName = companyBranch.BranchOfficeName,
            IdNumber = companyBranch.IdNumber,
            Address = companyBranch.Address,
            Email = companyBranch.Email,
            ContactPerson = companyBranch.ContactPerson,
            ContactPhone = companyBranch.ContactPhone,
            Place = companyBranch.Place,
            MunicipalityId = companyBranch.MunicipalityId,
            CreatedAt = companyBranch.CreatedAt,
            CreatedByUser = companyBranch.CreatedBy.FullName,
            UpdatedAt = companyBranch.UpdatedAt,
            UpdatedById = companyBranch.UpdatedById,
            IsDeleted = companyBranch.IsDeleted
        };
    }
}
