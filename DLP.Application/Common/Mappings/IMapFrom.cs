using Mapster;

namespace DLP.Application.Common.Mappings
{
    public interface IMapFrom<T>
    {
        public void Mapping(TypeAdapterConfig config) 
            => config.NewConfig(typeof(T), GetType());
    }
}
