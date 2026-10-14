namespace NorthWind.Sales.Entities.Dtos.Queries;

public sealed record OrderSearchItemDto(
    int OrderId,
    string InvoiceNumber,
    string CustomerId,
    string CustomerName,
    DateTime OrderDate,
    decimal Subtotal,
    decimal Tax,
    decimal Total);
