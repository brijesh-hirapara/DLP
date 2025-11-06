using DLP.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Newtonsoft.Json;
using System.ComponentModel;
using System.Globalization;
using System.Reflection;

namespace DLP.Application.Common.Extensions;

public static class CommonExtensions
{
    public static bool IsOneOf(this Enum enumeration, params Enum[] enums)
    {
        return enums.Contains(enumeration);
    }

    public static string GetRawDescription(this Enum value)
    {
        if (value == null)
        {
            return string.Empty;
        }

        var type = value.GetType();
        var field = type.GetField(value.ToString());

        return field?.GetCustomAttribute<DescriptionAttribute>()?.Description ?? value.ToString();
    }

    public static bool IsSuperAdminOrCountry(this List<AccessLevelType> providedAccessLevels)
    {
        return providedAccessLevels.Contains(AccessLevelType.SuperAdministrator);
    }

    public static async Task<byte[]> ToByteArrayAsync(this IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return null;
        }

        using (var memoryStream = new MemoryStream())
        {
            file.CopyTo(memoryStream);
            var response =  memoryStream.ToArray();

            return response;
        }
    }

    public static T DeepClone<T>(this T obj)
    {
        var settings = new JsonSerializerSettings
        {
            PreserveReferencesHandling = PreserveReferencesHandling.Objects,
            ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
            Formatting = Formatting.Indented
        };

        string jsonString = JsonConvert.SerializeObject(obj, settings);
        return JsonConvert.DeserializeObject<T>(jsonString, settings);
    }

    public static bool IsMinistryDatabase(this DatabaseFacade databaseFacade)
    {
        return databaseFacade.GetDbConnection().ConnectionString.ToLower().Contains("database=kgh_ministry");
    }
    
    public static string GetDatabaseKey(this DatabaseFacade databaseFacade)
    {
        var connectionString = databaseFacade.GetDbConnection().ConnectionString.ToLower();

        if (connectionString.Contains("database=kgh_ministry"))
            return "MVTEO";
        if (connectionString.Contains("database=kgh_fbih_db"))
            return "Federacija Bosne i Hercegovine";
        if (connectionString.Contains("database=kgh_srpska_db"))
            return "Republika Srpska";
        if (connectionString.Contains("database=kgh_brcko_db"))
            return "Brčko distrikta BiH";

        return "Unknown";
    }

    public static DateTime? TryConvertStringToDate(this string date)
    {
        return DateTime.TryParseExact(date, "MM/dd/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime data) ? data : (DateTime?)null;
    }

}
