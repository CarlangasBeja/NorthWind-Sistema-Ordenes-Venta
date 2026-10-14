using NorthWind.Events.Entities.Interfaces;

namespace NorthWind.Sales.Backend.UseCases.CreateOrder;

// Una fotografía inmutable de los datos necesarios para notificar la orden.
// No contiene credenciales ni depende de servicios SMTP.
internal sealed record SpecialOrderProduct(int ProductId, string ProductName, short Quantity);

internal sealed record SpecialOrderCreatedEvent(
    int OrderId,
    int ProductsCount,
    string CustomerId,
    string CustomerName,
    string ShipAddress,
    string ShipCity,
    string ShipCountry,
    string? ShipPostalCode,
    DateTime OrderDate,
    IReadOnlyList<SpecialOrderProduct> Products) : IDomainEvent;
