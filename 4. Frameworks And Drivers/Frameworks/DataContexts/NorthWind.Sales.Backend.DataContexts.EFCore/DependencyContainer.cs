using NorthWind.Sales.Backend.DataContexts.EFCore.Options;
using NorthWind.Sales.Backend.DataContexts.EFCore.Services;
using NorthWind.Sales.Backend.Repositories.Interfaces;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyContainer
{
    public static IServiceCollection AddDataContexts(
        this IServiceCollection services,
        Action<DBOptions> configureDBOptions)
    {
        services.Configure(configureDBOptions);

        services.AddScoped<INorthWindSalesCommandsDataContext,
            NorthWindSalesCommandsDataContext>();

        services.AddScoped<INorthWindSalesQueriesDataContext,
            NorthWindSalesQueriesDataContext>();

        services.AddScoped<INorthWindDomainLogsDataContext,
            NorthWindDomainLogsDataContext>();

        return services;
    }
}
