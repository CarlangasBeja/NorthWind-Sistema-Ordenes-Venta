using NorthWind.Validation.Entities.Interfaces;
using NorthWind.ValidationService.FluentValidation.Services;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyContainer
{
    public static IServiceCollection AddValidationService(
        this IServiceCollection services)
    {
        services.AddScoped(
            typeof(IValidationService<>),
            typeof(FluentValidationService<>));

        return services;
    }

    public static IServiceCollection AddFluentValidationService(
        this IServiceCollection services) =>
        services.AddValidationService();
}