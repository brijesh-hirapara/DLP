using System.Reflection;

namespace DLP.Application.Common.Constants;

// Define the attribute
[AttributeUsage(AttributeTargets.Field)]
public class PredefinedUserGroupAttribute : Attribute { }

public static class PredefinedUserGroups
{
    [PredefinedUserGroup]
    public static readonly string SUPER_ADMINISTRATOR = "Super Administrator";


    /// <summary>
    /// User group on level 3 with privileges as described in 5.6 from documentation.
    /// When users view registers and reports they will be able to see data only for their institution.
    /// </summary>    
    [PredefinedUserGroup] public static readonly string COMP_DLP_SHIPPER = "Shipper";

    /// <summary>
    /// User group on level 3 with privileges as described in 5.7 from documentation.
    /// When users view registers and reports they will be able to see data only for their institution.
    /// </summary>    
    [PredefinedUserGroup] public static readonly string COMP_DLP_CARRIER = "Carrier";

    public static bool IsPredefined(string role)
    {
        return typeof(PredefinedUserGroups)
            .GetFields(BindingFlags.Static | BindingFlags.Public)
            .Where(field => field.GetCustomAttribute<PredefinedUserGroupAttribute>() != null)
            .Any(field => (string?)field?.GetValue(null) == role);
    }
}
