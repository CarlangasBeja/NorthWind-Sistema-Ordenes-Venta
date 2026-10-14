using NorthWind.Sales.Backend.BusinessObjects.ValueObjects;
using NorthWind.Sales.Entities.Dtos.Queries;

namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Repositories;

public interface IQueriesRepository
{
    Task<decimal?> GetCustomerCurrentBalance(string customerId);
    Task<IEnumerable<ProductUnitsInStock>> GetProductsUnitsInStock(IEnumerable<int> productIds);
    Task<PagedResultDto<CustomerSearchItemDto>> SearchCustomers(string? search, string? field, int page, int pageSize);
    Task<PagedResultDto<ProductSearchItemDto>> SearchProducts(string? search, string? field, int page, int pageSize);
    Task<PagedResultDto<OrderSearchItemDto>> SearchOrders(string? search, string? field, int page, int pageSize);
    Task<OrderInvoiceDto?> GetOrderInvoice(int orderId);
}
