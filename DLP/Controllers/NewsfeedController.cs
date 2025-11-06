using System;
using DLP.Application.Newsfeed.Commands;
using DLP.Application.Newsfeed.DTOs;
using DLP.Application.Newsfeed.Queries;
using DLP.Application.UserGroups.DTOs;
using DLP.Application.UserGroups.Queries;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsfeedController: ApiControllerBase
    {
        [HttpGet("my-audience")]
        public async Task<ActionResult<List<GroupOverviewDto>>> GetMyAudience()
        {
            var query = new GetUserGroupsQuery();
            return Ok(await Mediator.Send(query));
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> CreatePost([FromBody] CreateNewPostCommand command)
        {
            var postId = await Mediator.Send(command);
            return Ok(postId);
        }

        [HttpGet]
        public async Task<ActionResult<List<PostDto>>> GetPosts([FromQuery] GetPostsQuery query)
        {
            var posts = await Mediator.Send(query);
            return Ok(posts);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(Guid id)
        {
            var command = new DeletePostCommand { PostId = id };
            var deletedPostId = await Mediator.Send(command);
            return Ok(new { Message = "Post deleted successfully", DeletedPostId = deletedPostId });
        }
    }
}

