using DLP.Application.CompanyBranches.DTOs;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using DLP.Application.ActivityLogs.Dto;
using DLP.Domain.Enums;
using DLP.Application.Dashboard.DTOs;

namespace DLP.Application.Dashboard.Queries;

public class GetPlainDashboardStatsQuery : IRequest<PlainStatsDto>
{
}

public class GetPlainDashboardStatsQueryHandler : IRequestHandler<GetPlainDashboardStatsQuery, PlainStatsDto>
{
    private readonly IAppDbContext _context;

    public GetPlainDashboardStatsQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<PlainStatsDto> Handle(GetPlainDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var response = new PlainStatsDto
        {
            TotalActiveTechnicians = await _context.Users.CountAsync(x => x.IsActive && x.IsCertifiedTechnician, cancellationToken: cancellationToken),
            TotalActiveEquipments = await _context.Equipments.CountAsync(x => !x.IsArchived && !x.IsDeleted, cancellationToken),
            TotalPendingRequests = await _context.Requests.CountAsync(x => x.Status == RequestStatus.Pending, cancellationToken),
            TotalServiceCompanies = await _context.Organizations.Include(x => x.CompanyRegisterTypes).CountAsync(z => z.CompanyRegisterTypes.Any(z => z.Type == CompanyType.ServiceCompanyEnterpreneur), cancellationToken: cancellationToken)
        };

        return response;
    }
}
