using System;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using DLP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace DLP.Application.Newsfeed.Commands
{
    public class CreateNewPostCommand : IRequest<Guid>
    {
        public string Subject { get; set; }
        public string Content { get; set; }
        public List<string> PostAudiences { get; set; }
    }

    public class CreateNewPostCommandHandler : IRequestHandler<CreateNewPostCommand, Guid>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUserService;

        public CreateNewPostCommandHandler(IAppDbContext dbContext, IActivityLogger activityLogger, ICurrentUserService currentUserService)
        {
            _dbContext = dbContext;
            _activityLogger = activityLogger;
            _currentUserService = currentUserService;
        }

        public async Task<Guid> Handle(CreateNewPostCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var post = new Post
                {
                    Id = Guid.NewGuid(),
                    Subject = request.Subject,
                    Content = request.Content,
                    CreatedAt = DateTime.UtcNow,
                    CreatedById = _currentUserService.UserId,
                    IsDeleted = false
                };
                post.PostAudiences = request.PostAudiences.Select(roleId => new PostAudience
                {
                    PostId = post.Id,
                    RoleId = roleId
                }).ToList();

                _dbContext.Posts.Add(post);
                await _dbContext.SaveChangesAsync(cancellationToken);

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Created a new post (ID: {post.Id})."
                });

                return post.Id;
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Failed to create a new post", _currentUserService.UserId);
                throw;
            }
        }
    }

}

