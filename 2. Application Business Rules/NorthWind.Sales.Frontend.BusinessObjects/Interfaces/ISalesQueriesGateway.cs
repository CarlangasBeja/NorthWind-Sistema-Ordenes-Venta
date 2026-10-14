using NorthWind.Sales.Entities.Dtos.Queries;

namespace NorthWind.Sales.Frontend.BusinessObjects.Interfaces;

public interface ISalesQueriesGateway
{
    Task<PagedResultDto<CustomerSearchItemDto>> SearchCustomersAsync(string? search, string? field, int page, int pageSize);
    Task<PagedResultDto<ProductSearchItemDto>> SearchProductsAsync(string? search, string? field, int page, int pageSize);
    Task<PagedResultDto<OrderSearchItemDto>> SearchOrdersAsync(string? search, string? field, int page, int pageSize);
    Task<OrderInvoiceDto?> GetOrderInvoiceAsync(int orderId);
    Task<byte[]> GetOrderPdfAsync(int orderId);
}
