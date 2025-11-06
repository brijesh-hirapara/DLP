using System;
namespace DLP.Application.Newsfeed.DTOs
{
    public class PostDto
    {
        public Guid Id { get; set; }
        public string Subject { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string OrganizationOfCreator { get; set; }
    }
}

