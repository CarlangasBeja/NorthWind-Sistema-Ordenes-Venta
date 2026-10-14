using NorthWind.Sales.Backend.BusinessObjects.Interfaces.Queries;
using NorthWind.Sales.Backend.BusinessObjects.Interfaces.Repositories;
using NorthWind.Sales.Entities.Dtos.Queries;
using NorthWind.Sales.Entities.ValueObjects;

namespace NorthWind.Sales.Backend.UseCases.Queries;

internal sealed class SalesQueriesInteractor(IQueriesRepository repository) : ISalesQueriesInputPort
{
    public Task<PagedResultDto<CustomerSearchItemDto>> SearchCustomers(string? search, string? field, int page, int pageSize) =>
        repository.SearchCustomers(search, NormalizeField(field), NormalizePage(page), NormalizePageSize(pageSize));

    public Task<PagedResultDto<ProductSearchItemDto>> SearchProducts(string? search, string? field, int page, int pageSize, bool includeOutOfStock = false) =>
        repository.SearchProducts(search, NormalizeField(field), NormalizePage(page), NormalizePageSize(pageSize), includeOutOfStock);

    public Task<PagedResultDto<OrderSearchItemDto>> SearchOrders(string? search, string? field, int page, int pageSize) =>
        repository.SearchOrders(search, NormalizeField(field), NormalizePage(page), NormalizePageSize(pageSize));

    public Task<OrderInvoiceDto?> GetOrderInvoice(int orderId) =>
        repository.GetOrderInvoice(orderId);

    private static int NormalizePage(int page) => page < 1 ? 1 : page;

    private static int NormalizePageSize(int pageSize) =>
        Math.Clamp(pageSize <= 0 ? SalesConstants.DefaultPageSize : pageSize, 1, SalesConstants.MaximumPageSize);

    private static string NormalizeField(string? field) =>
        string.IsNullOrWhiteSpace(field) ? "all" : field.Trim().ToLowerInvariant();
}
