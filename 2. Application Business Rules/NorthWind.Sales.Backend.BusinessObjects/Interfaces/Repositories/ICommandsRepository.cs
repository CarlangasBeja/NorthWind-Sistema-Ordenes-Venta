using NorthWind.Entities.Interfaces;
using NorthWind.Sales.Backend.BusinessObjects.Aggregates;
namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Repositories;
public interface ICommandsRepository : IUnitOfWork
{
    Task CreateOrder(OrderAggregate order);
    Task<bool> CustomerExists(string id);
    Task CreateCustomer(string id, string name, decimal balance);
    Task<bool> UpdateCustomerBalance(string id, decimal balance);
}
