using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.DTOs;
using DLP.Application.Common.Extensions;
using DLP.Application.Common.Interfaces;
using DLP.Application.Requests.DTOs;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Requests.Queries;
public class GetRequestFileQuery : IRequest<FileResultDto>
{
    public Guid FileId { get; set; }
    public AccessLevelType CurrentUserAccessLevel { get; set; }
    public Guid? CurrentUserCompanyId { get; set; }
    public string CurrentUserId { get; internal set; }
}

public class GetRequestFileQueryHandler : IRequestHandler<GetRequestFileQuery, FileResultDto>
{
    private readonly IAppDbContext _context;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUser;

    public GetRequestFileQueryHandler(IAppDbContext context, IActivityLogger activityLogger, ICurrentUserService currentUser)
    {
        _context = context;
        _activityLogger = activityLogger;
        _currentUser = currentUser;
    }

    public async Task<FileResultDto> Handle(GetRequestFileQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var requestFile = await _context.RequestFiles
                    .Include(x => x.Request)
                    .FirstOrDefaultAsync(rf => rf.Id == request.FileId, cancellationToken: cancellationToken)
                ?? throw new FileNotFoundException("The requested file was not found.");

            //if (!request.CurrentUserAccessLevel.IsOneOf(AccessLevelType.SuperAdministrator, AccessLevelType.CountryOfBiH))
            //{
            //    if (requestFile.Request.CompanyId != request.CurrentUserCompanyId)
            //    {
            //        await _activityLogger.Error("User doesn't have permissions to get request file!", _currentUser.UserId);
            //        throw new UnauthorizedAccessException("You don't have permissions to access this resource");
            //    }
            //}

            if (!File.Exists(requestFile.FilePath))
            {
                await _activityLogger.Error("The requested file was not found.", _currentUser.UserId);
                throw new FileNotFoundException("The requested file was not found.");
            }

            var fileContents = await File.ReadAllBytesAsync(requestFile.FilePath, cancellationToken);
            await _activityLogger.Add(new ActivityLogDto
            {
                UserId = _currentUser.UserId,
                LogTypeId = (int)LogTypeEnum.INFO,
                Activity = "Successfully retrieved a request file",
            });

            return new FileResultDto
            {
                ContentType = requestFile.ContentType,
                FileContents = fileContents,
                FileName = requestFile.FileName
            };
        }
        catch (Exception ex)
        {
            await _activityLogger.Exception(ex.Message, "An error occurred while handling the GetRequestFileQuery", request.CurrentUserId);
            throw;
        }
    }
}
