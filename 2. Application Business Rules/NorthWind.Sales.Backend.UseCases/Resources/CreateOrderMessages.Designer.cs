namespace NorthWind.Sales.Backend.UseCases.Resources;
internal static class CreateOrderMessages
{
    public const string CustomerIdNotFoundError = "El cliente seleccionado no existe.";
    public const string CustomerWithBalanceErrorTemplate = "El cliente {0} tiene un saldo pendiente de {1}.";
    public const string ProductIdNotFoundErrorTemplate = "El producto {0} no existe.";
    public const string UnitsInStockLessThanQuantityErrorTemplate = "La cantidad solicitada {0} supera el stock disponible ({1}) del producto {2}.";
    public const string SendEmailSubject = "Orden especial creada";
    public const string SendEmailBodyTemplate = "La orden {0} fue creada con {1} productos.";
    public const string StartingPurchaseOrderCreation = "Iniciando creación de orden de venta";
    public const string PurchaseOrderCreatedTemplate = "Orden de venta {0} creada.";
    public const string OrderCreationCancelledTemplate = "Creación de orden de venta {0} cancelada.";
}
