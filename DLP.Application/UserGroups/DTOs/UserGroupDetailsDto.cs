using DLP.Domain.Enums;

namespace DLP.Application.UserGroups.DTOs;

public class UserGroupDetailsDto
{
    public string Name { get; set; }
    public AccessLevelType AccessLevel { get; set; }
    public string AccessLevelDesc { get; set; }
    public List<GroupUserDto> Users { get; set; }
    public List<ModuleFunctionalitiesDto> ModuleFunctionalities { get; set; } = new List<ModuleFunctionalitiesDto>();
}

public class GroupUserDto
{
    public string Id { get; set; }
    public string FullName { get; set; }
}

public class AssignUserToGroupDto
{
    public string Id { get; set; }
}
