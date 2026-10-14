namespace NorthWind.Sales.Entities.Dtos.Customers;

/// <summary>CurrentBalance es la deuda pendiente del cliente: cero = sin deuda.</summary>
public sealed record CustomerWriteDto(string Id, string Name, decimal CurrentBalance);
public sealed record CustomerBalanceDto(decimal CurrentBalance);
public sealed record CustomerOperationResult(bool Success, string Message);
