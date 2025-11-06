using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Qualifications.DTOs;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Qualifications.Queries;
public class CheckCertificateNumberAvailabilityQuery : IRequest<List<CertificateNumberAvailabilityResult>>
{
    public List<string> CertificationNumbers { get; set; } = new();
    public Guid? OrganizationId { get; set; }
}


public class CheckCertificateNumberAvailabilityQueryHandler : IRequestHandler<CheckCertificateNumberAvailabilityQuery, List<CertificateNumberAvailabilityResult>>
{
    private readonly IAppDbContext _dbContext;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUserService;

    public CheckCertificateNumberAvailabilityQueryHandler(IAppDbContext dbContext, IActivityLogger activityLogger, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _activityLogger = activityLogger;
        _currentUserService = currentUserService;
    }

    public async Task<List<CertificateNumberAvailabilityResult>> Handle(CheckCertificateNumberAvailabilityQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var certificateNumbers = request.CertificationNumbers;

            var qualifications = await _dbContext.Qualifications
                .Include(q => q.CertifiedTechnician)
                    .ThenInclude(c => c.Organization)
                .Where(q => certificateNumbers.Contains(q.CertificateNumber) && q.IsDeleted == false)
                .ToListAsync(cancellationToken);

            var certificateNumberAvailabilityResults = certificateNumbers.Select(certificateNumber =>
            {
                var qualification = qualifications.FirstOrDefault(q => q.CertificateNumber == certificateNumber && q.IsDeleted == false);
                bool isAvailable = false;
                if (qualification != null)
                {
                    isAvailable = qualification.CertificateDuration >= DateTime.UtcNow && qualification.CertifiedTechnician.IsActive == true && qualification.CertifiedTechnician.IsDeleted == false &&  qualification.CertifiedTechnician.MustChangePassword == false && (
                        !qualification.CertifiedTechnician.OrganizationId.HasValue ||
                        qualification.CertifiedTechnician.OrganizationId == request.OrganizationId ||
                        (
                            qualification.CertifiedTechnician.OrganizationId.HasValue &&
                            qualification.CertifiedTechnician.Organization.Type == Domain.Enums.OrganizationTypeEnum.INSTITUTION // trainingcenter
                        )
                    );
                }

                return new CertificateNumberAvailabilityResult
                {
                    CertificateNumber = certificateNumber,
                    CertifiedTechnicianFullName = qualification?.CertifiedTechnician?.FullName ?? "",
                    IsAvailable = isAvailable
                };
            }).ToList();

            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUserService.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Certificate number availability check executed successfully."
            });

            return certificateNumberAvailabilityResults;
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "Failed to check certificate number availability", _currentUserService.UserId);

            throw;
        }
    }
}