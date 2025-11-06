using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.CompanyBranches.NotificationHandlers;
using DLP.Application.CompanyBranches.Requests;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.CompanyBranches.Commands;

public class CreateCompanyBranchCommand : IRequest<Guid>
{
    public Guid OrganizationId { get; set; }
    public CreateCompanyBranchRequest Request { get; set; }
}

public class CreateCompanyBranchCommandHandler : IRequestHandler<CreateCompanyBranchCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _logger;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMediator _mediator;

    public CreateCompanyBranchCommandHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUserService, IMediator mediator)
    {
        _context = context;
        _logger = logger;
        _currentUserService = currentUserService;
        _mediator = mediator;
    }

    public async Task<Guid> Handle(CreateCompanyBranchCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var request = command.Request;
            var organizationId = command.OrganizationId;
            var companyBranch = new CompanyBranch
            {
                Id = Guid.NewGuid(),
                BranchOfficeName = request.BranchOfficeName,
                IdNumber = request.IdNumber,
                OrganizationId = organizationId,
                Address = request.Address,
                Email = request.Email,
                ContactPerson = request.ContactPerson,
                ContactPhone = request.ContactPhone,
                Place = request.Place,
                MunicipalityId = request.MunicipalityId,
                IsDeleted = false,
                ActionTakenBy = _currentUserService.UserId,
            };

            companyBranch.BeforeLocalSync();
            _context.CompanyBranches.Add(companyBranch);
            await _context.SaveChangesAsync(cancellationToken);

            await _mediator.Publish(new CompanyBranchCreatedNotification(companyBranch.DeepClone()), cancellationToken);

            await _logger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Company branch created successfully"
            });



            return companyBranch.Id;
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to create a company branch", _currentUserService.UserId);
            throw new Exception(ex.Message);
        }
    }
}
