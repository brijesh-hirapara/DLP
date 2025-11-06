using System;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Enums;
using MediatR;

namespace DLP.Application.Newsfeed.Commands
{
    public class DeletePostCommand : IRequest<Unit>
    {
        public Guid PostId { get; set; }
    }

    public class DeletePostCommandHandler : IRequestHandler<DeletePostCommand, Unit>
    {
        private readonly IAppDbContext _dbContext;
        private readonly IActivityLogger _activityLogger;
        private readonly ICurrentUserService _currentUserService;

        public DeletePostCommandHandler(IAppDbContext dbContext, IActivityLogger activityLogger, ICurrentUserService currentUserService)
        {
            _dbContext = dbContext;
            _activityLogger = activityLogger;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(DeletePostCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var post = _dbContext.Posts.FirstOrDefault(p => p.Id == request.PostId) ?? throw new InvalidOperationException("Post not found.");
                post.IsDeleted = true;
                post.UpdatedById = _currentUserService.UserId;
                post.UpdatedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync(cancellationToken);

                await _activityLogger.Add(new ActivityLogDto
                {
                    UserId = _currentUserService.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = $"Deleted post (ID: {post.Id})."
                });

                return Unit.Value;
            }
            catch (Exception ex)
            {
                await _activityLogger.Exception(ex.Message, "Failed to delete a post", _currentUserService.UserId);
                throw;
            }
        }
    }

}

