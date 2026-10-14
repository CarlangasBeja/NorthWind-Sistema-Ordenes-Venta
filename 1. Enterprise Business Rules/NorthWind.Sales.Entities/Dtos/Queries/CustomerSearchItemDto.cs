namespace NorthWind.Sales.Entities.Dtos.Queries;

public sealed record CustomerSearchItemDto(
    string Id,
    string Name,
    decimal CurrentBalance);
