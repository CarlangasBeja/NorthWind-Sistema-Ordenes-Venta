using NorthWind.Sales.Backend.BusinessObjects.Interfaces.CreateOrder; using NorthWind.Sales.Backend.Presenters.CreateOrder;
namespace Microsoft.Extensions.DependencyInjection; public static class DependencyContainer { public static IServiceCollection AddPresenters(this IServiceCollection s){s.AddScoped<ICreateOrderOutputPort,CreateOrderPresenter>();return s;} }
