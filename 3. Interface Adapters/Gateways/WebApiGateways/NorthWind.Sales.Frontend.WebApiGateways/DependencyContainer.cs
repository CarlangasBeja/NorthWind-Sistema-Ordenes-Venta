using NorthWind.HttpDelegatingHandlers;
using NorthWind.Sales.Frontend.BusinessObjects.Interfaces;
using NorthWind.Sales.Frontend.WebApiGateways.CreateOrder;
using NorthWind.Sales.Frontend.WebApiGateways.Queries;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyContainer
{
    public static IServiceCollection AddWebApiGateways(
        this IServiceCollection services,
        Action<HttpClient> configureHttpClient,
        Action<IHttpClientBuilder> configureHttpClientBuilder)
    {
        services.AddExceptionDelegatingHandler();

        var createOrderBuilder = services
            .AddHttpClient<ICreateOrderGateway, CreateOrderGateway>(configureHttpClient)
            .AddHttpMessageHandler<ExceptionDelegatingHandler>();
        configureHttpClientBuilder(createOrderBuilder);

        var queriesBuilder = services
            .AddHttpClient<ISalesQueriesGateway, SalesQueriesGateway>(configureHttpClient)
            .AddHttpMessageHandler<ExceptionDelegatingHandler>();
        configureHttpClientBuilder(queriesBuilder);

        return services;
    }
}
