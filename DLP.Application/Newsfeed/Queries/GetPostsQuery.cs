using System;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.Common.Mappings;
using DLP.Application.Common.Pagination;
using DLP.Application.Newsfeed.DTOs;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Newsfeed.Queries
{
    public class GetPostsQuery : IRequest<PaginatedList<PostDto>>
    {
        public int PageSize { get; set; } = 10;
        public int PageNumber { get; set; } = 1;
        public bool OnlySentByMe { get; set; }
    }

    public class GetPostsQueryHandler : IRequestHandler<GetPostsQuery, PaginatedList<PostDto>>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUserService;

        public GetPostsQueryHandler(IAppDbContext dbContext, IActivityLogger activityLogger, ICurrentUserService currentUserService)
        {
            _dbContext = dbContext;
            _activityLogger = activityLogger;
            _currentUserService = currentUserService;
        }

        public async Task<PaginatedList<PostDto>> Handle(GetPostsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var audience = await _dbContext.UserRoles
                    .Where(x => x.UserId == _currentUserService.UserId)
                    .Select(x => x.RoleId)
                    .ToListAsync(cancellationToken);

                var posts = _dbContext.Posts
                    .Include(x => x.CreatedBy)
                    .ThenInclude(x => x.Organization)
                    .Where(x =>
                        (request.OnlySentByMe && x.CreatedById == _currentUserService.UserId) ||
                        (!request.OnlySentByMe && !x.IsDeleted && x.PostAudiences.Any(pa => audience.Contains(pa.RoleId)))
                    )
                    .OrderByDescending(p => p.CreatedAt)
                    .Skip((request.PageNumber - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .Select(p => new PostDto
                    {
                        Id = p.Id,
                        Subject = p.Subject,
                        Content = p.Content,
                        CreatedAt = p.CreatedAt,
                        CreatedBy = p.CreatedBy.FullName,
                        OrganizationOfCreator = p.CreatedBy.Organization.Name
                    });

                var paginatedList = await posts.PaginatedListAsync(request.PageNumber, request.PageSize);

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Retrieved posts successfully."
                });

                return paginatedList;
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Failed to retrieve posts", _currentUserService.UserId);
                throw;
            }
        }
    }

}

