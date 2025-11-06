namespace DLP.Application.UserGroups.DTOs;
public class ModuleFunctionalitiesDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public bool Checked { get; set; }
    public List<FunctionalityDto> Functionalities { get; set; }
}

public class FunctionalityDto
{
    public string Name { get; set; }
    public string ModuleName { get; set; }
    public string Description { get; set; }
    public bool Checked { get; set; }
}
