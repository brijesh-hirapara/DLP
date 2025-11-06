using Mapster;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Common.Mappings
{
    public class MappingProfile : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            ApplyMappingsFromAssembly(config, Assembly.GetExecutingAssembly());
        }

        private void ApplyMappingsFromAssembly(TypeAdapterConfig config, Assembly assembly)
        {
            var types = assembly.GetExportedTypes()
                .Where(t => t.GetInterfaces().Any(i =>
                    i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IMapFrom<>)))
                .ToList();

            foreach (var type in types)
            {
                var instance = Activator.CreateInstance(type);

                var methodInfo = type.GetMethod("Mapping");

                methodInfo?.Invoke(instance, new object[] { config });
            }
        }
    }
}
