namespace NorthWind.Sales.Entities.Dtos.Queries;

public sealed record OrderInvoiceDetailDto(
    int ProductId,
    string ProductName,
    decimal UnitPrice,
    short Quantity,
    decimal Subtotal);
