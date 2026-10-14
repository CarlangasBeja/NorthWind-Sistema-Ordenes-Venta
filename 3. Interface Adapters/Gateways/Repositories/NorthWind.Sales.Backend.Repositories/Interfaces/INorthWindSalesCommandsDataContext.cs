using NorthWind.Sales.Backend.BusinessObjects.POCOEntities;
using NorthWind.Sales.Backend.Repositories.Entities;

namespace NorthWind.Sales.Backend.Repositories.Interfaces;

public interface INorthWindSalesCommandsDataContext
{
    Task AddOrderAsync(Order order);
    Task AddOrderDetailsAsync(IEnumerable<OrderDetail> orderDetails);
    Task<bool> DecreaseProductStockAsync(int productId, short quantity);
    Task<decimal?> GetProductUnitPriceAsync(int productId);
    Task SaveChangesAsync();
    Task<bool> CustomerExistsAsync(string customerId);
    Task AddCustomerAsync(Customer customer);
    Task<bool> UpdateCustomerBalanceAsync(string customerId, decimal balance);
}
