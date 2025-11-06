namespace DLP.Application.Common.Sorting;
public class SortingBy
{
    public string PropertyName { get; set; }
    public bool IsDescending { get; set; }
    public SortingBy()
    {

    }

    public SortingBy(string propertyName, bool isDescending)
    {
        PropertyName = propertyName;
        IsDescending = isDescending;
    }
}
