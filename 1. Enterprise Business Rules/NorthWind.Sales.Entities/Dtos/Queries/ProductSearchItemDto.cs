namespace NorthWind.Sales.Entities.Dtos.Queries;

public sealed record ProductSearchItemDto(
    int Id,
    string Name,
    decimal UnitPrice,
    short UnitsInStock);
