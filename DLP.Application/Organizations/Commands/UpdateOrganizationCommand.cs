using Hangfire;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Organizations.Notifications;
using DLP.Application.Organizations.Requests;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Organizations.Commands;

public class UpdateOrganizationCommand : IRequest<Unit>
{
    public Guid OrganizationId { get; set; }
    public OrganizationRequest Organization { get; set; }
    public string UpdatedById { get; set; }
}

public class UpdateOrganizationCommandHandler : IRequestHandler<UpdateOrganizationCommand, Unit>
{
    private readonly IAppDbContext _context;
    private readonly IMediator _mediator;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUserService;
    private readonly IBackgroundJobClient _backgroundJobClient;

    public UpdateOrganizationCommandHandler(
        IAppDbContext context,
        IMediator mediator,
        IActivityLogger activityLogger,
        ICurrentUserService currentUserService,
        IBackgroundJobClient backgroundJobClient)
    {
        _context = context;
        _mediator = mediator;
        _activityLogger = activityLogger;
        _currentUserService = currentUserService;
        _backgroundJobClient = backgroundJobClient;
    }

    public async Task<Unit> Handle(UpdateOrganizationCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var organization = await _context.Organizations.Include(x => x.ContactPerson).FirstOrDefaultAsync(x => x.Id == request.OrganizationId, cancellationToken)
                               ?? throw new NotFoundException($"Organization with ID {request.OrganizationId} not found.");

            organization.Name = request.Organization.Name;
            organization.IdNumber = request.Organization.IdNumber;
            organization.TaxNumber = request.Organization.TaxNumber;
            organization.ResponsiblePersonFullName = request.Organization.ResponsiblePersonFullName;
            organization.ResponsiblePersonFunction = request.Organization.ResponsiblePersonFunction;
            organization.Address = request.Organization.Address;
            organization.Place = request.Organization.Place;
            organization.MunicipalityId = request.Organization.MunicipalityId;
            organization.Email = request.Organization.Email;
            organization.PhoneNumber = request.Organization.PhoneNumber;
            organization.WebsiteUrl = request.Organization.WebsiteUrl;
            organization.PostCode = request.Organization.PostCode;
            organization.CountryId = request.Organization.CountryId;

            organization.ContactPerson.FirstName = request.Organization.ContactPersonFirstName;
            organization.ContactPerson.LastName = request.Organization.ContactPersonLastName;

            _context.Organizations.Update(organization);
           await _context.SaveChangesAsync(cancellationToken);

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = $"Organization (ID: {organization.Id}) updated successfully."
            });

            await _mediator.Publish(new UpdateOrganizationNotification(organization.Id, organization.Type),
                cancellationToken);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to update organization", _currentUserService.UserId);

            throw;
        }
    }
}

