namespace NorthWind.Sales.Entities.ValueObjects;

public static class SalesConstants
{
    public const decimal TaxRate = 0.15m;
    public const int DefaultPageSize = 5;
    public const int MaximumPageSize = 25;

    public static string GetInvoiceNumber(int orderId) => $"INV-{orderId:000000}";
}
