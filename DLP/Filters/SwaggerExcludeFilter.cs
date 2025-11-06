using DLP.Application.Common.Attributes;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;

namespace DLP.Filters
{
    public class SwaggerExcludeFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema model, SchemaFilterContext context)
        {
            if (model?.Properties == null)
            {
                return;
            }

            var excludedProperties = context.Type.GetProperties().Where(t => t.GetCustomAttribute<SwaggerExcludeAttribute>() != null);

            foreach (var excludedProperty in excludedProperties)
            {
                var propertyToRemove = model.Properties.Keys.SingleOrDefault(x => x.ToLower() == excludedProperty.Name.ToLower());

                if (propertyToRemove != null)
                {
                    model.Properties.Remove(propertyToRemove);
                }
            }
        }
    }
}
