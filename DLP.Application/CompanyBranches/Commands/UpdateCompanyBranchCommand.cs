using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.CompanyBranches.NotificationHandlers;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.CompanyBranches.Commands;

public class UpdateCompanyBranchCommand : IRequest<Unit>
{
    public Guid BranchId { get; set; }
    public string BranchOfficeName { get; set; }
    public string IdNumber { get; set; }
    public string Address { get; set; }
    public string Email { get; set; }
    public string ContactPerson { get; set; }
    public string ContactPhone { get; set; }
    public string Place { get; set; }
    public Guid MunicipalityId { get; set; }
    public string UpdatedById { get; set; }
}

public class UpdateCompanyBranchCommandHandler : IRequestHandler<UpdateCompanyBranchCommand, Unit>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _logger;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMediator _mediator;

    public UpdateCompanyBranchCommandHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUserService, IMediator mediator)
    {
        _context = context;
        _logger = logger;
        _currentUserService = currentUserService;
        _mediator = mediator;
    }

    public async Task<Unit> Handle(UpdateCompanyBranchCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var companyBranch = await _context.CompanyBranches
                .FirstOrDefaultAsync(b => b.Id == request.BranchId, cancellationToken);

            if (companyBranch == null)
            {
                throw new NotFoundException($"Company branch with ID {request.BranchId} not found.");
            }

            companyBranch.BranchOfficeName = request.BranchOfficeName;
            companyBranch.IdNumber = request.IdNumber;
            companyBranch.Address = request.Address;
            companyBranch.Email = request.Email;
            companyBranch.ContactPerson = request.ContactPerson;
            companyBranch.ContactPhone = request.ContactPhone;
            companyBranch.Place = request.Place;
            companyBranch.MunicipalityId = request.MunicipalityId;
            companyBranch.UpdatedAt = DateTime.UtcNow;
            companyBranch.UpdatedById = request.UpdatedById;

            await _context.SaveChangesAsync(cancellationToken);

            await _mediator.Publish(new UpdateCompanyBranchNotification(companyBranch), cancellationToken);


            await _logger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Company branch updated successfully"
            });

            return Unit.Value;
        }
        catch (Exception ex)
        {
            await _logger.Exception(ex.Message, "Failed to update a company branch", _currentUserService.UserId);
            throw new Exception(ex.Message);
        }
    }
}

