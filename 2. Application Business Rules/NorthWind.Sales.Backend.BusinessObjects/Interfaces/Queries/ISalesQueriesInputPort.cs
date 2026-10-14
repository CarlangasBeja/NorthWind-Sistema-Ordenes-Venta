using NorthWind.Sales.Entities.Dtos.Queries;

namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Queries;

public interface ISalesQueriesInputPort
{
    Task<PagedResultDto<CustomerSearchItemDto>> SearchCustomers(string? search, string? field, int page, int pageSize);
    Task<PagedResultDto<ProductSearchItemDto>> SearchProducts(string? search, string? field, int page, int pageSize);
    Task<PagedResultDto<OrderSearchItemDto>> SearchOrders(string? search, string? field, int page, int pageSize);
    Task<OrderInvoiceDto?> GetOrderInvoice(int orderId);
}
