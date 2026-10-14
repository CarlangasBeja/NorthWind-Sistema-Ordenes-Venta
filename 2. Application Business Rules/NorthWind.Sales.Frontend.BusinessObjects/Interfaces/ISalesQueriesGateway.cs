using NorthWind.Sales.Entities.Dtos.Queries;
using NorthWind.Sales.Entities.Dtos.Customers;

namespace NorthWind.Sales.Frontend.BusinessObjects.Interfaces;

public interface ISalesQueriesGateway
{
    Task<PagedResultDto<CustomerSearchItemDto>> SearchCustomersAsync(string? search, string? field, int page, int pageSize);
    Task<PagedResultDto<ProductSearchItemDto>> SearchProductsAsync(string? search, string? field, int page, int pageSize, bool includeOutOfStock = false);
    Task<CustomerOperationResult> CreateCustomerAsync(CustomerWriteDto customer);
    Task<CustomerOperationResult> UpdateCustomerBalanceAsync(string id, decimal balance);
    Task<PagedResultDto<OrderSearchItemDto>> SearchOrdersAsync(string? search, string? field, int page, int pageSize);
    Task<OrderInvoiceDto?> GetOrderInvoiceAsync(int orderId);
    Task<byte[]> GetOrderPdfAsync(int orderId);
}
