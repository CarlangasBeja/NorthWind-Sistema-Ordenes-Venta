using Microsoft.Extensions.DependencyInjection.Extensions;
using NorthWind.Validation.Entities.Interfaces;
using NorthWind.Validation.Entities.Services;
namespace Microsoft.Extensions.DependencyInjection;
public static class DependencyContainer
{
    public static IServiceCollection AddDefaultModelValidatorHub(this IServiceCollection services)
    {
        services.TryAddScoped(typeof(IModelValidatorHub<>), typeof(ModelValidatorHub<>));
        return services;
    }
    public static IServiceCollection AddModelValidator<ModelType, ModelValidatorType>(this IServiceCollection services)
        where ModelValidatorType : class, IModelValidator<ModelType>
    {
        services.AddDefaultModelValidatorHub();
        services.AddScoped<IModelValidator<ModelType>, ModelValidatorType>();
        return services;
    }
}
