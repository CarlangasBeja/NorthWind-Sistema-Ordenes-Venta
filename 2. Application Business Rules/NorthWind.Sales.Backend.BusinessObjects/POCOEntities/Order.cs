using NorthWind.Sales.Backend.BusinessObjects.Enums;
namespace NorthWind.Sales.Backend.BusinessObjects.POCOEntities;
public class Order
{
    public int Id { get; set; }
    public string CustomerId { get; set; } = string.Empty;
    public string ShipAddress { get; set; } = string.Empty;
    public string ShipCity { get; set; } = string.Empty;
    public string ShipCountry { get; set; } = string.Empty;
    public string? ShipPostalCode { get; set; }
    public ShippingType ShippingType { get; set; } = ShippingType.Road;
    public DiscountType DiscountType { get; set; } = DiscountType.Percentage;
    public double Discount { get; set; } = 10;
    public DateTime OrderDate { get; set; } = DateTime.Now;
}
