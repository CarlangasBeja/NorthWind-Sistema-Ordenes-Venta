namespace NorthWind.Sales.Entities.ValueObjects;

public static class Endpoints
{
    public const string CreateOrder = "/CreateOrder";
    public const string SearchCustomers = "/api/customers/search";
    public const string SearchProducts = "/api/products/search";
    public const string CreateCustomer = "/api/customers";
    public const string UpdateCustomerBalance = "/api/customers/{customerId}/balance";
    public const string SearchOrders = "/api/orders/search";
    public const string GetOrderInvoice = "/api/orders/{orderId:int}";
    public const string GetOrderPdf = "/api/orders/{orderId:int}/pdf";
}
