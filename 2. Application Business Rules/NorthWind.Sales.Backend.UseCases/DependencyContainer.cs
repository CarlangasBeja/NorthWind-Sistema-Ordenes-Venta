using NorthWind.Events.Entities.Interfaces;
using NorthWind.Sales.Backend.BusinessObjects.Interfaces.CreateOrder;
using NorthWind.Sales.Backend.BusinessObjects.Interfaces.Queries;
using NorthWind.Sales.Backend.UseCases.CreateOrder;
using NorthWind.Sales.Backend.UseCases.Queries;
using NorthWind.Sales.Entities.Dtos.CreateOrder;
namespace Microsoft.Extensions.DependencyInjection;
public static class DependencyContainer
{
    public static IServiceCollection AddUseCasesServices(this IServiceCollection services)
    {
        services.AddScoped<ICreateOrderInputPort, CreateOrderInteractor>();
        services.AddScoped<ISalesQueriesInputPort, SalesQueriesInteractor>();
        services.AddModelValidator<CreateOrderDto,CreateOrderCustomerValidator>();
        services.AddModelValidator<CreateOrderDto,CreateOrderProductValidator>();
        services.AddScoped<IDomainEventHandler<SpecialOrderCreatedEvent>,SendEMailWhenSpecialOrderCreatedEventHandler>();
        return services;
    }
}
