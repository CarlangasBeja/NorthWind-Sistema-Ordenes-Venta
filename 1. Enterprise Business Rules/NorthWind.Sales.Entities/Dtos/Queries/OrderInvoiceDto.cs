namespace NorthWind.Sales.Entities.Dtos.Queries;

public sealed record OrderInvoiceDto(
    int OrderId,
    string InvoiceNumber,
    DateTime OrderDate,
    string CustomerId,
    string CustomerName,
    string ShipAddress,
    string ShipCity,
    string ShipCountry,
    string? ShipPostalCode,
    decimal Subtotal,
    decimal Tax,
    decimal Total,
    IReadOnlyCollection<OrderInvoiceDetailDto> Details);
