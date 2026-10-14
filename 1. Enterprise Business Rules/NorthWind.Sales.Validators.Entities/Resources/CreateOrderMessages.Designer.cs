namespace NorthWind.Sales.Validators.Entities.Resources;
internal static class CreateOrderMessages
{
    public static string ProductIdGreaterThanZero => "El producto es obligatorio.";
    public static string QuantityGreaterThanZero => "La cantidad debe ser mayor que cero.";
    public static string UnitPriceGreaterThanZero => "El precio unitario debe ser mayor que cero.";
    public static string CustomerIdRequired => "El cliente es obligatorio.";
    public static string CustomerIdRequiredLength => "El identificador del cliente debe contener exactamente 5 caracteres.";
    public static string ShipAddressRequired => "La dirección de entrega es obligatoria.";
    public static string ShipAddressMaximumLength => "La dirección de entrega no puede superar los 60 caracteres.";
    public static string ShipCityRequired => "La ciudad de entrega es obligatoria.";
    public static string ShipCityMinimumLength => "La ciudad debe contener al menos 3 caracteres.";
    public static string ShipCityMaximumLength => "La ciudad no puede superar los 15 caracteres.";
    public static string ShipCountryRequired => "El país de entrega es obligatorio.";
    public static string ShipCountryMinimumLength => "El país debe contener al menos 3 caracteres.";
    public static string ShipCountryMaximumLength => "El país no puede superar los 15 caracteres.";
    public static string ShipPostalCodeMaximumLength => "El código postal no puede superar los 10 caracteres.";
    public static string OrderDetailsRequired => "Los productos de la orden son obligatorios.";
    public static string OrderDetailsNotEmpty => "Agregue al menos un producto a la orden.";
}
