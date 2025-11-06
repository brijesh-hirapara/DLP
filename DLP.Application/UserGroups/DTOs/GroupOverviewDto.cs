namespace DLP.Application.UserGroups.DTOs
{
    public class GroupOverviewDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public int TotalMembers { get; set; }
        public int TotalActiveMembers { get; set; }
        public int TotalPermissions { get; set; }
        public bool IsEditable { get; set; }
    }
}
