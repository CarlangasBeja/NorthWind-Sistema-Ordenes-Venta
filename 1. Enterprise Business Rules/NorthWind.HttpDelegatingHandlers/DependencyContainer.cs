namespace Microsoft.Extensions.DependencyInjection;
public static class DependencyContainer
{
    public static IServiceCollection AddExceptionDelegatingHandler(this IServiceCollection services)
    {
        services.AddTransient<NorthWind.HttpDelegatingHandlers.ExceptionDelegatingHandler>(); return services;
    }
}
