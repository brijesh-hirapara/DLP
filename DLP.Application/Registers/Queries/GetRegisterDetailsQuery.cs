using DLP.Application.ActivityLogs.Dto;
using DLP.Application.CertifiedTechnicians.Queries;
using DLP.Application.Common.Interfaces;
using DLP.Application.Qualifications.DTOs;
using DLP.Application.Registers.DTOs;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Registers.Queries;

public class GetRegisterDetailsQuery : IRequest<RegisterDetailsDto>
{
    public Guid Id { get; set; }
}

public class GetRegisterDetailsQueryHandler : IRequestHandler<GetRegisterDetailsQuery, RegisterDetailsDto>
{
    private readonly IAppDbContext _context;
    private readonly IMediator _mediator;
    private readonly IActivityLogger _logger;
    private readonly ICurrentUserService _currentUser;

    public GetRegisterDetailsQueryHandler(IAppDbContext context, IMediator mediator, IActivityLogger logger, ICurrentUserService currentUser)
    {
        _context = context;
        _mediator = mediator;
        _logger = logger;
        _currentUser = currentUser;
    }

    public async Task<RegisterDetailsDto> Handle(GetRegisterDetailsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var organization = await _context.Organizations
                .Include(x => x.ContactPerson)
                .Include(x => x.BusinessActivity)
                .Include(i => i.Branches)
                    .ThenInclude(x => x.Municipality)
                .Include(x => x.Branches)
                    .ThenInclude(x => x.Equipments)
                        .ThenInclude(x => x.RefrigerantType)
                .Include(i => i.Municipality)
                    .ThenInclude(x => x.Canton)
                .Include(i => i.Municipality)
                    .ThenInclude(x => x.StateEntity)
                .Include(i => i.CompanyRegisterTypes)
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken: cancellationToken) ?? throw new Exception($"Organization {request.Id} not found");

            var response = RegisterDetailsDto.FromOrganization(organization);
            response.BranchesWithEquipments = organization.Branches.Select(x => new BranchWithEquipmentsDetailsDto
            {
                Name = x.BranchOfficeName,
                Email = x.Email,
                Address = x.Address,
                ContactPerson = x.ContactPerson,
                ContactPhone = x.ContactPhone,
                Municipality = x.Municipality?.Name,
                Canton = x.Municipality?.Canton?.Name,
                Entity = x.Municipality?.StateEntity?.Name,
                EquipmentsCount = x.Equipments.Count,
            }).ToList();
            var licneseDuration = _context.Requests.FirstOrDefault(da => !da.IsDeleted && da.CompanyId == organization.Id)?.LicenseDuration;

            response.CompanyLicenseDuration = licneseDuration ;

            response.CertificationNumbers = (await _mediator.Send(new GetCertifiedTechniciansQuery
            {
                PageSize = -1,
                OrganizationId = request.Id,
            })).Items
            .Where(x => !x.IsDeleted)
            .Select(x => new CertificateNumberAvailabilityResult
            {
                CertifiedTechnicianFullName = x.FirstName + " " + x.LastName,
                CertificateNumber = x.CertificateNumber,
            }).ToList();


            await _logger.Add(new ActivityLogDto
            {
                UserId = _currentUser.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved Register Details for Organization " + request.Id
            });

            return response;
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to retrieve Register Details for Organization " + request.Id, _currentUser.UserId);
            throw;
        }
    }
}



