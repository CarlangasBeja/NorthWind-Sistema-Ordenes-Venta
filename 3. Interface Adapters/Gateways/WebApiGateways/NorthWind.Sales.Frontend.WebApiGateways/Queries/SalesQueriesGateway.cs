using System.Net;
using System.Net.Http.Json;
using NorthWind.Sales.Entities.Dtos.Customers;
using NorthWind.Sales.Entities.Dtos.Queries;
using NorthWind.Sales.Entities.ValueObjects;
using NorthWind.Sales.Frontend.BusinessObjects.Interfaces;

namespace NorthWind.Sales.Frontend.WebApiGateways.Queries;

internal sealed class SalesQueriesGateway(HttpClient client) : ISalesQueriesGateway
{
    public Task<PagedResultDto<CustomerSearchItemDto>> SearchCustomersAsync(string? search, string? field, int page, int pageSize) =>
        GetRequiredAsync<PagedResultDto<CustomerSearchItemDto>>(
            BuildSearchUri(Endpoints.SearchCustomers, search, field, page, pageSize));

    public Task<PagedResultDto<ProductSearchItemDto>> SearchProductsAsync(string? search, string? field, int page, int pageSize, bool includeOutOfStock = false) =>
        GetRequiredAsync<PagedResultDto<ProductSearchItemDto>>(
            BuildSearchUri(Endpoints.SearchProducts, search, field, page, pageSize) +
                (includeOutOfStock ? "&includeOutOfStock=true" : string.Empty));

    public async Task<CustomerOperationResult> CreateCustomerAsync(CustomerWriteDto customer)
    {
        var response = await client.PostAsJsonAsync(Endpoints.CreateCustomer, customer);
        return await ReadCustomerOperationAsync(response);
    }

    public async Task<CustomerOperationResult> UpdateCustomerBalanceAsync(string id, decimal balance)
    {
        var response = await client.PutAsJsonAsync(
            $"/api/customers/{Uri.EscapeDataString(id)}/balance", new CustomerBalanceDto(balance));
        return await ReadCustomerOperationAsync(response);
    }

    private static async Task<CustomerOperationResult> ReadCustomerOperationAsync(HttpResponseMessage response)
    {
        var result = await response.Content.ReadFromJsonAsync<CustomerOperationResult>();
        response.EnsureSuccessStatusCode();
        return result ?? throw new HttpRequestException("El servidor no devolvió una confirmación.");
    }

    public Task<PagedResultDto<OrderSearchItemDto>> SearchOrdersAsync(string? search, string? field, int page, int pageSize) =>
        GetRequiredAsync<PagedResultDto<OrderSearchItemDto>>(
            BuildSearchUri(Endpoints.SearchOrders, search, field, page, pageSize));

    public async Task<OrderInvoiceDto?> GetOrderInvoiceAsync(int orderId)
    {
        var response = await client.GetAsync($"/api/orders/{orderId}");
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<OrderInvoiceDto>();
    }

    public async Task<byte[]> GetOrderPdfAsync(int orderId)
    {
        var response = await client.GetAsync($"/api/orders/{orderId}/pdf");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsByteArrayAsync();
    }

    private async Task<T> GetRequiredAsync<T>(string uri)
    {
        var response = await client.GetAsync(uri);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<T>()
            ?? throw new HttpRequestException("El servidor devolvió una respuesta vacía.");
    }

    private static string BuildSearchUri(string endpoint, string? search, string? field, int page, int pageSize)
    {
        var encodedSearch = Uri.EscapeDataString(search ?? string.Empty);
        var encodedField = Uri.EscapeDataString(field ?? "all");
        return $"{endpoint}?search={encodedSearch}&field={encodedField}&page={page}&pageSize={pageSize}";
    }
}
